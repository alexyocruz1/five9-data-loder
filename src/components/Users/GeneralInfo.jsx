import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, ButtonGroup, Accordion, Card, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Download, ArrowRepeat } from 'react-bootstrap-icons';
import { transformUsersGeneralResponse } from '../../utils';
import Login from '../Login';
import { MaterialReactTable, MRT_TablePagination } from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { useMediaQuery } from '@mui/material';
import { Box } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileEarmarkPdf } from 'react-bootstrap-icons';

const RolesAndGroupsDetail = ({ row }) => {
  const { roles, agentGroups, skills } = row.original;

  const renderPermissions = (permissions) => (
    <ListGroup variant="flush">
      {permissions.map((permission, index) => (
        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
          {permission.type}
          <Badge bg={permission.value ? "success" : "danger"} pill>
            {permission.value ? "Yes" : "No"}
          </Badge>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <h4>Roles, Agent Groups, and Skills Detail</h4>
      <Accordion>
        {Object.entries(roles).map(([roleName, roleData], index) => (
          <Accordion.Item eventKey={index.toString()} key={index}>
            <Accordion.Header>{roleName.charAt(0).toUpperCase() + roleName.slice(1)}</Accordion.Header>
            <Accordion.Body>
              {roleData.alwaysRecorded !== undefined && (
                <p>Always Recorded: {roleData.alwaysRecorded ? "Yes" : "No"}</p>
              )}
              {roleData.attachVmToEmail !== undefined && (
                <p>Attach VM to Email: {roleData.attachVmToEmail ? "Yes" : "No"}</p>
              )}
              {roleData.sendEmailOnVm !== undefined && (
                <p>Send Email on VM: {roleData.sendEmailOnVm ? "Yes" : "No"}</p>
              )}
              <h5>Permissions</h5>
              {renderPermissions(roleData.permissions)}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      <Card className="mt-3">
        <Card.Header>Agent Groups</Card.Header>
        <Card.Body>
          {agentGroups && agentGroups.length > 0 ? (
            <ListGroup>
              {agentGroups.map((group, index) => (
                <ListGroup.Item key={index}>{group}</ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No agent groups assigned</p>
          )}
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Header>Skills</Card.Header>
        <Card.Body>
          {skills && skills.length > 0 ? (
            <ListGroup>
              {skills.map((skill, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  {skill.skillName}
                  <Badge bg="info" pill>
                    Level: {skill.level}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No skills assigned</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

const GeneralInfo = () => {
  const { usersGeneralInfo, setUsersGeneralInfo, setUsername, username, apiRoute } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isTabletOrMobile = useMediaQuery('(max-width:991px)');
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const prepareDataForCsv = (data) => {
    return data.map(user => {
      const flatUser = {
        'Full Name': user.generalInfo?.fullName || '',
        'Email': user.generalInfo?.EMail || '',
        'Username': user.generalInfo?.userName || '',
        'Active': user.generalInfo?.active ? 'Yes' : 'No',
        'Extension': user.generalInfo?.extension || '',
        'ID': user.generalInfo?.id || '',
        'Roles': Object.keys(user.roles || {}).join(', '),
        'Agent Groups': Array.isArray(user.agentGroups) ? user.agentGroups.join(', ') : '',
        'Skills': Array.isArray(user.skills) 
          ? user.skills.map(skill => `${skill.skillName || ''} (Level: ${skill.level || ''})`).join(', ')
          : '',
      };

      // Add role-specific permissions
      if (user.roles) {
        Object.entries(user.roles).forEach(([roleName, roleData]) => {
          if (roleData && roleData.permissions) {
            roleData.permissions.forEach(permission => {
              if (permission && typeof permission.type === 'string' && typeof permission.value === 'boolean') {
                flatUser[`${roleName.charAt(0).toUpperCase() + roleName.slice(1)} - ${permission.type}`] = permission.value ? 'Yes' : 'No';
              }
            });
          }
          if (roleData) {
            if (typeof roleData.alwaysRecorded === 'boolean') {
              flatUser[`${roleName} - Always Recorded`] = roleData.alwaysRecorded ? 'Yes' : 'No';
            }
            if (typeof roleData.attachVmToEmail === 'boolean') {
              flatUser[`${roleName} - Attach VM to Email`] = roleData.attachVmToEmail ? 'Yes' : 'No';
            }
            if (typeof roleData.sendEmailOnVm === 'boolean') {
              flatUser[`${roleName} - Send Email on VM`] = roleData.sendEmailOnVm ? 'Yes' : 'No';
            }
          }
        });
      }

      return flatUser;
    });
  };

  const handleExportRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      console.error('No rows to export');
      return;
    }
    const rowData = prepareDataForCsv(rows.map(row => row.original));
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };
  
  const handleExportData = () => {
    if (Array.isArray(usersGeneralInfo) && usersGeneralInfo.length > 0) {
      const preparedData = prepareDataForCsv(usersGeneralInfo);
      const csv = generateCsv(csvConfig)(preparedData);
      download(csvConfig)(csv);
    } else {
      console.error('No data to export');
    }
  };

  const generatePDF = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Helper function to add a centered title
    const addTitle = (text, y) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80); // Dark blue color
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const textOffset = (pageWidth - textWidth) / 2;
      doc.text(text, textOffset, y);
    };

    // Helper function to add a subtitle
    const addSubtitle = (text, y) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94); // Slightly lighter blue
      doc.text(text, 14, y);
    };

    // Add a header to each page
    const addHeader = () => {
      doc.setFillColor(41, 128, 185); // Light blue background
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(12);
      doc.text('User General Information', 14, 13);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 14, 13, { align: 'right' });
    };

    // Add a footer to each page
    const addFooter = () => {
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128); // Gray text
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    };

    data.forEach((user, index) => {
      if (index > 0) {
        doc.addPage();
      }

      addHeader();

      // User name as title
      addTitle(user.generalInfo?.fullName || 'N/A', 40);

      // General Info
      addSubtitle('General Information', 55);
      doc.autoTable({
        startY: 60,
        head: [['Field', 'Value']],
        body: [
          ['Email', user.generalInfo?.EMail || 'N/A'],
          ['Username', user.generalInfo?.userName || 'N/A'],
          ['Active', user.generalInfo?.active ? 'Yes' : 'No'],
          ['Extension', user.generalInfo?.extension || 'N/A'],
          ['ID', user.generalInfo?.id || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { cellPadding: 5, fontSize: 10 },
      });

      // Roles
      const rolesY = doc.lastAutoTable.finalY + 15;
      addSubtitle('Roles and Permissions', rolesY);
      doc.autoTable({
        startY: rolesY + 5,
        head: [['Role', 'Permissions']],
        body: Object.entries(user.roles || {}).map(([role, data]) => [
          role,
          Array.isArray(data?.permissions) 
            ? data.permissions.filter(p => p?.value).map(p => p?.type).join(', ')
            : 'N/A'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        columnStyles: { 0: { cellWidth: 40 } },
        styles: { cellPadding: 5, fontSize: 10 },
      });

      // Agent Groups
      const groupsY = doc.lastAutoTable.finalY + 15;
      addSubtitle('Agent Groups', groupsY);
      doc.autoTable({
        startY: groupsY + 5,
        head: [['Agent Groups']],
        body: Array.isArray(user.agentGroups) 
          ? user.agentGroups.map(group => [group])
          : [['No agent groups']],
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { cellPadding: 5, fontSize: 10 },
      });

      // Skills
      const skillsY = doc.lastAutoTable.finalY + 15;
      addSubtitle('Skills', skillsY);
      doc.autoTable({
        startY: skillsY + 5,
        head: [['Skill Name', 'Level']],
        body: Array.isArray(user.skills)
          ? user.skills.map(skill => [skill?.skillName || 'N/A', skill?.level || 'N/A'])
          : [['No skills', 'N/A']],
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        styles: { cellPadding: 5, fontSize: 10 },
      });
    });

    addFooter();
    doc.save('users-general-info.pdf');
  };

  const handleExportPDF = () => {
    if (Array.isArray(usersGeneralInfo) && usersGeneralInfo.length > 0) {
      setIsPdfLoading(true);
      try {
        generatePDF(usersGeneralInfo);
        setSuccessMessage('PDF generated successfully!');
        setShowSuccessToast(true);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setErrorMessage('An error occurred while generating the PDF. Please try again.');
        setShowErrorToast(true);
      } finally {
        setIsPdfLoading(false);
      }
    } else {
      setErrorMessage('No data available to export to PDF');
      setShowErrorToast(true);
    }
  };

  const fetchAllUsers = async (PassedUsername, PassedPassword, rememberUsername) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiRoute}/api/users/getUsersInfo/`, {
        username: PassedUsername,
        password: PassedPassword,
      });

      setUsersGeneralInfo(transformUsersGeneralResponse(response));
      setUsername(rememberUsername ? PassedUsername : '');

      handleLoginSuccess('Credentials confirmed and users general info synced!');
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message || 'Failed to fetch users general info';
      handleLoginError(errorMsg);
    } finally {
      setLoading(false);
      setShowLoginModal(false);
    }
  };

  const handleLoginSuccess = (message) => {
    setShowLoginModal(false);
    setSuccessMessage(message);
    setShowSuccessToast(true);
  };

  const handleLoginError = (message) => {
    setErrorMessage(message);
    setShowErrorToast(true);
  };

  const columns = useMemo(
    () => [
      { accessorKey: 'generalInfo.fullName', header: 'FULL NAME' },
      { accessorKey: 'generalInfo.EMail', header: 'EMAIL' },
      { accessorKey: 'generalInfo.userName', header: 'USERNAME' },
      { 
        accessorKey: 'generalInfo.active', 
        header: 'ACTIVE',
        Cell: ({ cell }) => cell.getValue() ? 'Yes' : 'No'
      },
      { accessorKey: 'generalInfo.extension', header: 'EXTENSION' },
      { accessorKey: 'generalInfo.id', header: 'ID' },
      { 
        accessorKey: 'roles',
        header: 'ROLES',
        Cell: ({ cell }) => {
          const roles = cell.getValue();
          return roles && Object.keys(roles).length > 0 
            ? Object.keys(roles).join(', ') 
            : 'No roles';
        }
      },
      { 
        accessorKey: 'agentGroups',
        header: 'AGENT GROUPS',
        Cell: ({ cell }) => {
          const groups = cell.getValue();
          return groups && groups.length > 0 
            ? groups.join(', ') 
            : 'No groups';
        }
      },
      { 
        accessorKey: 'skills',
        header: 'SKILLS',
        Cell: ({ cell }) => {
          const skills = cell.getValue();
          return skills && skills.length > 0 
            ? skills.map(skill => skill.skillName).join(', ') 
            : 'No skills';
        }
      },
    ],
    []
  );

  return (
    <Container fluid={isTabletOrMobile}>
      <Row className="align-items-center mb-3">
        <Col>
          <div className="d-flex align-items-center">
            <h1 className="me-3 mb-0">Users General Info</h1>
            <Button 
              variant="outline-primary" 
              onClick={() => setShowLoginModal(true)}
              className="d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            >
              <ArrowRepeat size={20} />
            </Button>
          </div>
        </Col>
      </Row>
      <div className='table-container' style={{marginBottom: '5rem'}}>
        <MaterialReactTable
          columns={columns}
          data={usersGeneralInfo || []}
          enableRowSelection
          enableExpanding
          renderDetailPanel={({ row }) => (
            <RolesAndGroupsDetail row={row} />
          )}
          muiTableBodyRowProps={({ row }) => ({
            onClick: row.getToggleExpandedHandler(),
            sx: { cursor: 'pointer' },
          })}
          renderTopToolbar={({ table }) => {
            const isDataAvailable = usersGeneralInfo && usersGeneralInfo.length > 0;
            return (
              <ButtonGroup vertical={isTabletOrMobile}>
                <Button
                  variant="link"
                  className="icon-link icon-link-hover"
                  style={{ '--bs-icon-link-transform': 'translate3d(0, -.125rem, 0)' }}
                  onClick={handleExportData}
                  disabled={!isDataAvailable}
                >
                  <Download className="bi" aria-hidden="true" />
                  {isTabletOrMobile ? 'All' : 'Export All Data'}
                </Button>
                <Button
                  variant="link"
                  className="icon-link icon-link-hover"
                  style={{ '--bs-icon-link-transform': 'translate3d(0, -.125rem, 0)' }}
                  disabled={table.getPrePaginationRowModel().rows.length === 0}
                  onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
                >
                  <Download className="bi" aria-hidden="true" />
                  {isTabletOrMobile ? 'All Rows' : 'Export All Rows'}
                </Button>
                <Button
                  variant="link"
                  className="icon-link icon-link-hover"
                  style={{ '--bs-icon-link-transform': 'translate3d(0, -.125rem, 0)' }}
                  disabled={table.getRowModel().rows.length === 0}
                  onClick={() => handleExportRows(table.getRowModel().rows)}
                >
                  <Download className="bi" aria-hidden="true" />
                  {isTabletOrMobile ? 'Page' : 'Export Page Rows'}
                </Button>
                <Button
                  variant="link"
                  className="icon-link icon-link-hover"
                  style={{ '--bs-icon-link-transform': 'translate3d(0, -.125rem, 0)' }}
                  disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
                  onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                >
                  <Download className="bi" aria-hidden="true" />
                  {isTabletOrMobile ? 'Selected' : 'Export Selected Rows'}
                </Button>
                <Button
                  variant="link"
                  className="icon-link icon-link-hover"
                  style={{ '--bs-icon-link-transform': 'translate3d(0, -.125rem, 0)' }}
                  onClick={handleExportPDF}
                  disabled={!isDataAvailable || isPdfLoading}
                >
                  {isPdfLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FileEarmarkPdf className="bi" aria-hidden="true" />
                  )}
                  {isTabletOrMobile ? 'PDF' : (isPdfLoading ? 'Generating PDF...' : 'Export to PDF')}
                </Button>
              </ButtonGroup>
            );
          }}
          renderBottomToolbar={({ table }) => (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1rem',
                gap: '1rem',
              }}
            >
              {/* eslint-disable-next-line react/jsx-pascal-case */}
              <MRT_TablePagination table={table} />
              {table.getPrePaginationRowModel().rows.length > 0 && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: isTabletOrMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isTabletOrMobile ? 'flex-start' : 'center',
                  width: '100%',
                  gap: isTabletOrMobile ? '0.5rem' : '0'
                }}>
                  <span>{`${table.getSelectedRowModel().rows.length} row(s) selected`}</span>
                  {table.getSelectedRowModel().rows.length > 0 && (
                    <Button variant="outline-secondary" size="sm" onClick={() => table.resetRowSelection()}>
                      Clear Selection
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}
          muiTableContainerProps={{
            sx: { maxHeight: '800px' },
          }}
          muiTableBodyCellProps={{
            sx: { wordBreak: 'break-word' },
          }}
          muiTableHeadCellProps={{
            sx: { wordBreak: 'break-word' },
          }}
          displayColumnDefOptions={{
            'mrt-row-expand': {
              size: 0,
            },
          }}
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'none' }}>
              {/* This is to prevent the default row actions from rendering */}
            </Box>
          )}
        />
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
          <Login username={username} endpoint={fetchAllUsers} loading={loading} />
        </Modal.Body>
      </Modal>

      <div className="toast-container position-fixed" style={{ top: 20, right: 20, zIndex: 1050 }}>
        <Toast
          onClose={() => setShowSuccessToast(false)}
          show={showSuccessToast}
          delay={3000}
          autohide={false}
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body style={{ color: 'white' }}>{successMessage}</Toast.Body>
        </Toast>

        <Toast
          onClose={() => setShowErrorToast(false)}
          show={showErrorToast}
          delay={3000}
          autohide={false}
          bg="danger"
        >
          <Toast.Header>
            <strong className="me-auto">Error</strong>
          </Toast.Header>
          <Toast.Body>{errorMessage}</Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default GeneralInfo;