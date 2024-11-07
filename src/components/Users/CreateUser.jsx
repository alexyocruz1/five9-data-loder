import React, { useState, useContext, useMemo, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, Offcanvas, ListGroup, ProgressBar, Card, Form, Tabs, Tab, InputGroup, FormControl } from 'react-bootstrap';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Papa from 'papaparse';
import { getRoles } from '../../utils';
import { Upload, PersonPlus, QuestionCircle, Download, Check, X, PeopleFill, Search } from 'react-bootstrap-icons';
import { MRT_TablePagination } from 'material-react-table';
import { useMediaQuery } from '@mui/material';

const filteredPermissions = (permissions, searchTerm) => {
  return permissions.filter(permission => 
    permission.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const RolesModal = ({ showRolesModal, setShowRolesModal, availableRoles, rolePermissions, handleRolePermissionChange, applyRolesToUsers, searchTerm, activeTab, setActiveTab, setSearchTerm }) => {
  const modalContent = useMemo(() => (
    <Modal show={showRolesModal} onHide={() => setShowRolesModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Set Roles and Permissions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <InputGroup.Text>
            <Search />
          </InputGroup.Text>
          <FormControl
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
          {Object.keys(availableRoles).map(role => (
            <Tab eventKey={role} title={role.charAt(0).toUpperCase() + role.slice(1)} key={role}>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingLeft: '10px' }}>
                {role === 'agent' && (
                  <>
                    <Form.Check
                      type="checkbox"
                      id={`${role}-alwaysRecorded`}
                      label="Always Recorded"
                      checked={rolePermissions[role]?.alwaysRecorded ?? false}
                      onChange={(e) => handleRolePermissionChange(role, 'alwaysRecorded', e.target.checked)}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id={`${role}-attachVmToEmail`}
                      label="Attach VM to Email"
                      checked={rolePermissions[role]?.attachVmToEmail ?? false}
                      onChange={(e) => handleRolePermissionChange(role, 'attachVmToEmail', e.target.checked)}
                      className="mb-2"
                    />
                    <Form.Check
                      type="checkbox"
                      id={`${role}-sendEmailOnVm`}
                      label="Send Email on VM"
                      checked={rolePermissions[role]?.sendEmailOnVm ?? false}
                      onChange={(e) => handleRolePermissionChange(role, 'sendEmailOnVm', e.target.checked)}
                      className="mb-2"
                    />
                  </>
                )}
                {filteredPermissions(availableRoles[role].permissions, searchTerm).map(permission => (
                  <Form.Check
                    key={permission.type}
                    type="checkbox"
                    id={`${role}-${permission.type}`}
                    label={permission.label}
                    checked={rolePermissions[role]?.permissions?.find(p => p.type === permission.type)?.value ?? false}
                    onChange={(e) => handleRolePermissionChange(role, permission.type, e.target.checked)}
                    className="mb-2"
                  />
                ))}
              </div>
            </Tab>
          ))}
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRolesModal(false)}>Close</Button>
        <Button variant="primary" onClick={applyRolesToUsers}>Apply Roles</Button>
      </Modal.Footer>
    </Modal>
  ), [showRolesModal, availableRoles, rolePermissions, handleRolePermissionChange, applyRolesToUsers, searchTerm, activeTab, setActiveTab, setSearchTerm, setShowRolesModal]);

  return modalContent;
};

const CreateUser = () => {
  const { setUsername, username, apiRoute } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isCreateUserButtonEnabled, setIsCreateUserButtonEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [processedUsers, setProcessedUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [successfulUsers, setSuccessfulUsers] = useState([]);
  const [failedUsers, setFailedUsers] = useState([]);
  const isTabletOrMobile = useMediaQuery('(max-width:991px)');
  const fileInputRef = useRef(null);
  const [availableRoles, setAvailableRoles] = useState({});
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [rolePermissions, setRolePermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(Object.keys(availableRoles)[0]);

  useEffect(() => {
    setAvailableRoles(getRoles());
  }, []);

  const permittedColumns = [
    'userName', 'password', 'firstName', 'lastName', 'EMail'
  ];

  const cleanRoles = (roles) => {
    return Object.entries(roles).reduce((acc, [roleName, roleData]) => {
      const cleanedRole = {
        ...(roleData.alwaysRecorded !== undefined ? { alwaysRecorded: roleData.alwaysRecorded } : {}),
        ...(roleData.attachVmToEmail !== undefined ? { attachVmToEmail: roleData.attachVmToEmail } : {}),
        ...(roleData.sendEmailOnVm !== undefined ? { sendEmailOnVm: roleData.sendEmailOnVm } : {}),
        permissions: roleData.permissions.filter(p => p.value).map(({ type, value }) => ({ type, value }))
      };

      if (cleanedRole.permissions.length > 0 || 
          cleanedRole.alwaysRecorded || 
          cleanedRole.attachVmToEmail || 
          cleanedRole.sendEmailOnVm) {
        acc[roleName] = cleanedRole;
      }

      return acc;
    }, {});
  };

  const createUserInfo = async (PassedUsername, PassedPassword, rememberUsername, users) => {
    setLoading(true);
    setShowProgressModal(true);
    setTotalUsers(users.length);
    setProcessedUsers(0);

    const successful = [];
    const failed = [];
    try {
      for (let i = 0; i < users.length; i++) {
        setCurrentUser(users[i].userName);
        try {
          let userToCreate = {
            generalInfo: { ...users[i] },
            skills: [],
            agentGroups: [],
            roles: cleanRoles(users[i].roles || getRoles()),
            cannedReports: []
          };
          
          delete userToCreate.generalInfo.roles;

          if (Object.keys(userToCreate.roles).length === 0) {
            userToCreate.roles = {};
          }

          await axios.post(`${apiRoute}/api/users/createUser/`, {
            username: PassedUsername,
            password: PassedPassword,
            userInfo: userToCreate,
          });
          successful.push(users[i].userName);
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to create user';
          failed.push({ userName: users[i].userName, error: errorMessage });
        }
        setProcessedUsers(i + 1);
        setProgress(((i + 1) / users.length) * 100);
      }

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsername(rememberUsername ? PassedUsername : '');
      setErrorMessage('');

      handleCreateUserResult(successful, failed);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create users general info';
      setErrorMessage(errorMsg);
      handleCreateUserError(errorMsg);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowProgressModal(false);
        setShowLoginModal(false);
        setCurrentUser('');
        setProcessedUsers(0);
        setTotalUsers(0);
        setProgress(0);
      }, 500);
    }
  };

  const handleCreateUserResult = (successful, failed) => {
    setSuccessfulUsers(successful);
    setFailedUsers(failed);
    
    const successCount = successful.length;
    const failCount = failed.length;
    
    let summaryMessage = '';
    if (successCount > 0) {
      summaryMessage += `Successfully created ${successCount} user${successCount > 1 ? 's' : ''}. `;
    }
    if (failCount > 0) {
      summaryMessage += `Failed to create ${failCount} user${failCount > 1 ? 's' : ''}.`;
    }
    
    setToastMessage(summaryMessage);
    setShowSuccessToast(successCount > 0);
    setShowErrorToast(failCount > 0);
    setShowResultModal(true);
  };

  const handleCreateUserError = (message) => {
    setToastMessage(message);
    setShowErrorToast(true);
  };

  const booleanCellRenderer = ({ cell }) => {
    return cell.getValue() ? 'Yes' : 'No';
  };

  const columns = useMemo(() => {
    if (csvData && csvData.length > 0) {
      return Object.keys(csvData[0])
        .filter(key => key !== 'roles')
        .map((key) => ({
          accessorKey: key,
          header: key.replace(/_/g, ' ').toUpperCase(),
          Cell: ({ cell }) => {
            return typeof cell.getValue() === 'boolean' ? booleanCellRenderer({ cell }) : cell.getValue();
          },
        }));
    }
    return [];
  }, [csvData]);

  const table = useMaterialReactTable({
    columns,
    data: csvData || [],
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    getRowId: (row) => row.userName,
    enableSelectAll: true,
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: ({ table }) => (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button
          onClick={() => table.toggleAllRowsSelected()}
          variant="outline-secondary"
          size="sm"
          title={table.getIsAllRowsSelected() ? 'Deselect All' : 'Select All'}
        >
          {table.getIsAllRowsSelected() ? <X size={18} /> : <Check size={18} />}
        </Button>
        <Button 
          onClick={openRolesModal} 
          variant="outline-primary"
          size="sm"
          disabled={table.getSelectedRowModel().rows.length === 0}
          title="Set Roles for Selected Users"
        >
          <PeopleFill size={18} className="me-1" />
          Set Roles ({table.getSelectedRowModel().rows.length})
        </Button>
      </div>
    ),
    renderBottomToolbar: ({ table }) => {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          padding: '1rem',
          alignItems: 'center'
        }}>
          {/* eslint-disable-next-line react/jsx-pascal-case */}
          <MRT_TablePagination table={table} />
        </div>
      );
    },
    muiTableContainerProps: {
      sx: { maxHeight: '800px' },
    },
    muiTableBodyCellProps: {
      sx: {
        wordBreak: 'break-word',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        wordBreak: 'break-word',
      },
    },
  });

  const handleDownloadTemplate = () => {
    const csvContent = permittedColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setCsvData(null);
      setIsCreateUserButtonEnabled(false);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const csvColumns = Object.keys(results.data[0]);
          const hasAllPermittedColumns = permittedColumns.every((col) => csvColumns.includes(col));
  
          if (hasAllPermittedColumns) {
            const filteredData = results.data.filter(row => Object.values(row).some(value => value !== null && value !== ''));
            setCsvData(filteredData);
            setIsCreateUserButtonEnabled(true);
          } else {
            setToastMessage('CSV file must contain all the required columns: ' + permittedColumns.join(', ') + '.');
            setShowErrorToast(true);
            setIsCreateUserButtonEnabled(false);
          }
        },
        error: (error) => {
          setToastMessage('Failed to parse CSV file');
          setShowErrorToast(true);
          setIsCreateUserButtonEnabled(false);
        },
      });
    }
  };

  const handleAddUserCreateClick = () => {
    setShowLoginModal(true);
  };

  const openRolesModal = useCallback(() => {
    const selectedUsers = csvData.filter(user => rowSelection[user.userName]);
    
    // Check if any selected users have existing roles
    const existingRoles = selectedUsers.reduce((acc, user) => {
      if (user.roles) {
        Object.entries(user.roles).forEach(([roleName, roleData]) => {
          if (!acc[roleName]) {
            acc[roleName] = roleData;
          } else {
            // Merge permissions if they exist
            if (roleData.permissions) {
              acc[roleName].permissions = acc[roleName].permissions.map(existingPerm => {
                const matchingPerm = roleData.permissions.find(p => p.type === existingPerm.type);
                return {
                  ...existingPerm,
                  value: matchingPerm ? matchingPerm.value : existingPerm.value
                };
              });
            }
            // Merge other role properties
            ['alwaysRecorded', 'attachVmToEmail', 'sendEmailOnVm'].forEach(prop => {
              if (roleData[prop] !== undefined) {
                acc[roleName][prop] = roleData[prop];
              }
            });
          }
        });
      }
      return acc;
    }, {});

    // If there are existing roles with permissions, use them; otherwise use default roles
    const initialRoles = Object.keys(existingRoles).length > 0 
      ? existingRoles 
      : initializeRoles(availableRoles);

    setRolePermissions(initialRoles);
    setShowRolesModal(true);
  }, [csvData, rowSelection, availableRoles]);

  const handleRolePermissionChange = useCallback((role, permissionType, checked) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...(permissionType === 'alwaysRecorded' || permissionType === 'attachVmToEmail' || permissionType === 'sendEmailOnVm'
          ? { [permissionType]: checked }
          : {
              permissions: prev[role].permissions.map(p =>
                p.type === permissionType ? { ...p, value: checked } : p
              )
            }
        )
      }
    }));
  }, []);

  const applyRolesToUsers = useCallback(() => {
    const cleanedRoles = cleanRoles(rolePermissions);
    const updatedCsvData = csvData.map(user => {
      if (rowSelection[user.userName]) {
        return { ...user, roles: cleanedRoles };
      }
      return user;
    });
    setCsvData(updatedCsvData);
    setShowRolesModal(false);
    setRowSelection({});
  }, [csvData, rowSelection, rolePermissions]);

  const initializeRoles = (roles) => {
    return Object.entries(roles).reduce((acc, [roleName, roleData]) => {
      acc[roleName] = {
        ...roleData,
        permissions: roleData.permissions.map(perm => ({ ...perm }))
      };
      return acc;
    }, {});
  };

  return (
    <Container fluid={isTabletOrMobile}>
      <Row className="align-items-center mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="me-3 mb-0">Create Users</h1>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csvFileInput"
              ref={fileInputRef}
            />
            <label htmlFor="csvFileInput">
              <Button as="span" variant="outline-primary" className="me-2">
                <Upload className="me-1" /> Import CSV
              </Button>
            </label>
            <Button
              variant="outline-primary"
              onClick={handleAddUserCreateClick}
              disabled={!isCreateUserButtonEnabled}
              className="me-2"
            >
              <PersonPlus className="me-1" /> Create Users
            </Button>
          </div>
          <Button
            variant="outline-secondary"
            onClick={() => setShowOffcanvas(true)}
          >
            <QuestionCircle className="me-1" /> Help
          </Button>
        </Col>
      </Row>
      {errorMessage && <p>{errorMessage}</p>}
      <div className='table-container' style={{marginBottom: '5rem'}}>
        <MaterialReactTable table={table} />
      </div>

      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Login username={username} endpoint={(username, password, rememberUsername) => createUserInfo(username, password, rememberUsername, csvData)} loading={loading} />
        </Modal.Body>
      </Modal>

      <RolesModal 
        showRolesModal={showRolesModal}
        setShowRolesModal={setShowRolesModal}
        availableRoles={availableRoles}
        rolePermissions={rolePermissions}
        handleRolePermissionChange={handleRolePermissionChange}
        applyRolesToUsers={applyRolesToUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Modal
        show={showProgressModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Creating Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Processing user: {currentUser}</p>
          <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
          <p className="mt-2">
            Processed {processedUsers} out of {totalUsers} users
          </p>
        </Modal.Body>
      </Modal>

      <Modal show={showResultModal} onHide={() => setShowResultModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Creation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successfulUsers.length > 0 && (
            <>
              <h5>Successfully Created Users:</h5>
              <ListGroup style={{ maxHeight: '30vh', overflowY: 'auto', marginBottom: '1rem' }}>
                {successfulUsers.map((user, index) => (
                  <ListGroup.Item key={index} variant="success">{user}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
          {failedUsers.length > 0 && (
            <>
              <h5 className="mt-3">Failed to Create Users:</h5>
              <ListGroup style={{ maxHeight: '30vh', overflowY: 'auto' }}>
                {failedUsers.map((user, index) => (
                  <ListGroup.Item key={index} variant="danger">
                    {user.userName}: {user.error}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="toast-container position-fixed" style={{ top: 20, right: 20, zIndex: 1050 }}>
        <Toast
          onClose={() => setShowSuccessToast(false)}
          show={showSuccessToast}
          delay={5000}
          autohide={false}
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body style={{ color: 'white' }}>{toastMessage}</Toast.Body>
        </Toast>

        <Toast
          onClose={() => setShowErrorToast(false)}
          show={showErrorToast}
          delay={5000}
          autohide={false}
          bg="danger"
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body style={{ color: 'white' }}>{toastMessage}</Toast.Body>
        </Toast>
      </div>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>How to Create Users</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="mb-3">
            <Card.Header as="h5">Step 1: Prepare Your CSV File</Card.Header>
            <Card.Body>
              <Card.Text>
                Create a CSV file with the following required columns:
              </Card.Text>
              <ListGroup variant="flush">
                {permittedColumns.map((col) => (
                  <ListGroup.Item key={col}>{col}</ListGroup.Item>
                ))}
              </ListGroup>
              <Button 
                variant="outline-primary" 
                className="mt-3"
                onClick={handleDownloadTemplate}
              >
                <Download className="me-2" />
                Download CSV Template
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header as="h5">Step 2: Import Your CSV</Card.Header>
            <Card.Body>
              <Card.Text>
                Click the "Import CSV" button and select your prepared CSV file.
              </Card.Text>
              <Card.Text>
                Ensure all required columns are present and filled out correctly.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header as="h5">Step 3: Set Roles and Permissions</Card.Header>
            <Card.Body>
              <Card.Text>
                After importing, you can set roles and permissions for selected users.
              </Card.Text>
              <Card.Text>
                Select users in the table and click "Set Roles" to open the roles modal.
              </Card.Text>
              <Card.Text>
                Roles with at least one permission set to true will be assigned to the users.
              </Card.Text>
              <Card.Text>
                The agent role has additional options: "Always Recorded", "Attach VM to Email", and "Send Email on VM".
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header as="h5">Step 4: Create Users</Card.Header>
            <Card.Body>
              <Card.Text>
                Review the data in the table, including roles and permissions.
              </Card.Text>
              <Card.Text>
                Click "Create Users" to begin the user creation process.
              </Card.Text>
              <Card.Text>
                You'll be prompted to confirm your credentials before proceeding.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Step 5: Review Results</Card.Header>
            <Card.Body>
              <Card.Text>
                After the process completes, you'll see a summary of successful and failed user creations.
              </Card.Text>
              <Card.Text>
                You can view detailed results in the modal that appears.
              </Card.Text>
            </Card.Body>
          </Card>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default CreateUser;