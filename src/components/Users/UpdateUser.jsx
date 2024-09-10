import React, { useState, useContext, useMemo, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, Offcanvas, ListGroup, ProgressBar, Card, Form } from 'react-bootstrap';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Papa from 'papaparse';
import { Upload, PersonUp, QuestionCircle, Download } from 'react-bootstrap-icons';
import { MRT_TablePagination } from 'material-react-table';
import { useMediaQuery } from '@mui/material';

const UpdateUser = () => {
  const { setUsername, username, apiRoute } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isUpdateUserButtonEnabled, setIsUpdateUserButtonEnabled] = useState(false);
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
  const [selectedColumns, setSelectedColumns] = useState(['userName']);

  const permittedColumns = [
    'userName',
    'active', 'canChangePassword', 'EMail', 'extension', 'federationId', 'firstName', 'fullName', 'id', 'IEXScheduled', 'lastName', 'locale', 'mediaTypeConfig', 'mustChangePassword', 'password', 'phoneNumber', 'startDate', 'unifiedCommunicationId', 'userProfileName'
  ];

  const updateUserInfo = async (PassedUsername, PassedPassword, rememberUsername, users) => {
    setLoading(true);
    setShowProgressModal(true);
    setTotalUsers(users.length);
    setProcessedUsers(0);
    setProgress(0);
    
    const successful = [];
    const failed = [];
    try {
      for (let i = 0; i < users.length; i++) {
        const userToUpdate = users[i];
        setCurrentUser(userToUpdate.userName);
        try {
          await axios.put(`${apiRoute}/api/users/updateUser/`, {
            username: PassedUsername,
            password: PassedPassword,
            userGeneralInfo: userToUpdate
          });
          successful.push(userToUpdate.userName);
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to update user';
          failed.push({ userName: userToUpdate.userName, error: errorMessage });
        }
        setProcessedUsers(i + 1);
        setProgress(((i + 1) / users.length) * 100);
      }

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsername(rememberUsername ? PassedUsername : '');
      setErrorMessage('');

      handleUpdateUserResult(successful, failed);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update users general info';
      setErrorMessage(errorMsg);
      handleUpdateUserError(errorMsg);
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

  const handleUpdateUserResult = (successful, failed) => {
    setSuccessfulUsers(successful);
    setFailedUsers(failed);
    
    const successCount = successful.length;
    const failCount = failed.length;
    
    let summaryMessage = '';
    if (successCount > 0) {
      summaryMessage += `Successfully updated ${successCount} user${successCount > 1 ? 's' : ''}. `;
    }
    if (failCount > 0) {
      summaryMessage += `Failed to update ${failCount} user${failCount > 1 ? 's' : ''}.`;
    }
    
    setToastMessage(summaryMessage);
    setShowSuccessToast(successCount > 0);
    setShowErrorToast(failCount > 0);
    setShowResultModal(true);
  };

  const handleUpdateUserError = (message) => {
    setToastMessage(message);
    setShowErrorToast(true);
  };

  const booleanCellRenderer = ({ cell }) => {
    return cell.getValue() ? 'Yes' : 'No';
  };

  const columns = useMemo(() => {
    if (csvData && csvData.length > 0) {
      return Object.keys(csvData[0]).map((key) => ({
        accessorKey: key,
        header: key.replace(/_/g, ' ').toUpperCase(),
        Cell: typeof csvData[0][key] === 'boolean' ? booleanCellRenderer : undefined,
      }));
    }
    return [];
  }, [csvData]);

  const table = useMaterialReactTable({
    columns,
    data: csvData || [],
    enableRowSelection: false,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: () => null,
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
    const csvContent = selectedColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_update_template.csv');
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
      setIsUpdateUserButtonEnabled(false);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const csvColumns = Object.keys(results.data[0]);
          const hasRequiredColumn = csvColumns.includes('userName');
          const hasOnlyPermittedColumns = csvColumns.every((col) => permittedColumns.includes(col));

          if (hasRequiredColumn && hasOnlyPermittedColumns) {
            const filteredData = results.data.filter(row => Object.values(row).some(value => value !== null && value !== ''));
            setCsvData(filteredData);
            setIsUpdateUserButtonEnabled(true);
          } else {
            setToastMessage('CSV file must contain the required column: userName and only permitted columns.');
            setShowErrorToast(true);
            setIsUpdateUserButtonEnabled(false);
          }
        },
        error: (error) => {
          setToastMessage('Failed to parse CSV file');
          setShowErrorToast(true);
          setIsUpdateUserButtonEnabled(false);
        },
      });
    }
  };

  const handleAddUserUpdateClick = () => {
    setShowLoginModal(true);
  };

  const handleColumnSelection = (column) => {
    if (column === 'userName') return;
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  return (
    <Container fluid={isTabletOrMobile}>
      <Row className="align-items-center mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="me-3 mb-0">Update Users</h1>
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
              onClick={handleAddUserUpdateClick}
              disabled={!isUpdateUserButtonEnabled}
              className="me-2"
            >
              <PersonUp className="me-1" /> Update Users
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

      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login username={username} endpoint={(username, password, rememberUsername) => updateUserInfo(username, password, rememberUsername, csvData)} loading={loading} />
        </Modal.Body>
      </Modal>

      <Modal
        show={showProgressModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Updating Users</Modal.Title>
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
          <Modal.Title>User Update Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successfulUsers.length > 0 && (
            <>
              <h5>Successfully Updated Users:</h5>
              <ListGroup style={{ maxHeight: '30vh', overflowY: 'auto', marginBottom: '1rem' }}>
                {successfulUsers.map((user, index) => (
                  <ListGroup.Item key={index} variant="success">{user}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
          {failedUsers.length > 0 && (
            <>
              <h5 className="mt-3">Failed to Update Users:</h5>
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
          <Offcanvas.Title>How to Update Users</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="mb-3">
            <Card.Header as="h5">Step 1: Prepare Your CSV File</Card.Header>
            <Card.Body>
              <Card.Text>
                Create a CSV file with the following columns:
              </Card.Text>
              <Form>
                {permittedColumns.map((col) => (
                  <Form.Check 
                    type="checkbox"
                    id={`column-${col}`}
                    label={col}
                    checked={selectedColumns.includes(col)}
                    onChange={() => handleColumnSelection(col)}
                    key={col}
                    disabled={col === 'userName'}
                  />
                ))}
              </Form>
              <Button 
                variant="outline-primary" 
                className="mt-3"
                onClick={handleDownloadTemplate}
                disabled={selectedColumns.length === 1}
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
                Ensure the 'userName' column is present and all columns are permitted.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header as="h5">Step 3: Update Users</Card.Header>
            <Card.Body>
              <Card.Text>
                After importing, review the data in the table.
              </Card.Text>
              <Card.Text>
                Click "Update Users" to begin the user update process.
              </Card.Text>
              <Card.Text>
                You'll be prompted to confirm your credentials before proceeding.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header as="h5">Step 4: Review Results</Card.Header>
            <Card.Body>
              <Card.Text>
                After the process completes, you'll see a summary of successful and failed user updates.
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

export default UpdateUser;