import React, { useState, useContext, useMemo, useRef } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, Offcanvas, ListGroup, ProgressBar, Card, Form } from 'react-bootstrap';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Papa from 'papaparse';
import { Upload, PersonDash, QuestionCircle, Download } from 'react-bootstrap-icons';
import { MRT_TablePagination } from 'material-react-table';
import { useMediaQuery } from '@mui/material';

const RemoveUser = () => {
  const { setUsername, username, apiRoute } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isRemoveUserButtonEnabled, setIsRemoveUserButtonEnabled] = useState(false);
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

  const permittedColumns = ['userName'];

  const removeUserInfo = async (PassedUsername, PassedPassword, rememberUsername, users) => {
    setLoading(true);
    setShowProgressModal(true);
    setTotalUsers(users.length);
    setProcessedUsers(0);
    setProgress(0);

    const successful = [];
    const failed = [];
    try {
      for (let i = 0; i < users.length; i++) {
        const userToRemove = users[i].userName;
        setCurrentUser(userToRemove);
        try {
          await axios.post(`${apiRoute}/api/users/removeUser/`, {
            loginUser: PassedUsername,
            password: PassedPassword,
            userName: userToRemove,
          });
          successful.push(userToRemove);
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to remove user';
          failed.push({ userName: userToRemove, error: errorMessage });
        }
        setProcessedUsers(i + 1);
        setProgress(((i + 1) / users.length) * 100);
      }

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsername(rememberUsername ? PassedUsername : '');
      setErrorMessage('');

      handleRemoveUserResult(successful, failed);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to remove users general info';
      setErrorMessage(errorMsg);
      handleRemoveUserError(errorMsg);
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

  const handleRemoveUserResult = (successful, failed) => {
    setSuccessfulUsers(successful);
    setFailedUsers(failed);
    
    const successCount = successful.length;
    const failCount = failed.length;
    
    let summaryMessage = '';
    if (successCount > 0) {
      summaryMessage += `Successfully removed ${successCount} user${successCount > 1 ? 's' : ''}. `;
    }
    if (failCount > 0) {
      summaryMessage += `Failed to remove ${failCount} user${failCount > 1 ? 's' : ''}.`;
    }
    
    setToastMessage(summaryMessage);
    setShowSuccessToast(successCount > 0);
    setShowErrorToast(failCount > 0);
    setShowResultModal(true);
  };

  const handleRemoveUserError = (message) => {
    setToastMessage(message);
    setShowErrorToast(true);
  };

  const columns = useMemo(() => {
    if (csvData && csvData.length > 0) {
      return Object.keys(csvData[0]).map((key) => ({
        accessorKey: key,
        header: key.replace(/_/g, ' ').toUpperCase(),
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
    const csvContent = permittedColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_remove_template.csv');
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
      setIsRemoveUserButtonEnabled(false);

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const csvColumns = Object.keys(results.data[0]);
          const hasAllPermittedColumns = permittedColumns.every((col) => csvColumns.includes(col));
  
          if (hasAllPermittedColumns) {
            const filteredData = results.data.filter(row => Object.values(row).some(value => value !== null && value !== ''));
            setCsvData(filteredData);
            setIsRemoveUserButtonEnabled(true);
          } else {
            setToastMessage('CSV file must contain all the required columns: ' + permittedColumns.join(', ') + '.');
            setShowErrorToast(true);
            setIsRemoveUserButtonEnabled(false);
          }
        },
        error: (error) => {
          setToastMessage('Failed to parse CSV file');
          setShowErrorToast(true);
          setIsRemoveUserButtonEnabled(false);
        },
      });
    }
  };

  const handleRemoveUserClick = () => {
    setShowLoginModal(true);
  };

  return (
    <Container fluid={isTabletOrMobile}>
      <Row className="align-items-center mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="me-3 mb-0">Remove Users</h1>
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
              onClick={handleRemoveUserClick}
              disabled={!isRemoveUserButtonEnabled}
              className="me-2"
            >
              <PersonDash className="me-1" /> Remove Users
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
          <Login username={username} endpoint={(username, password, rememberUsername) => removeUserInfo(username, password, rememberUsername, csvData)} loading={loading} />
        </Modal.Body>
      </Modal>

      <Modal
        show={showProgressModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Removing Users</Modal.Title>
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
          <Modal.Title>User Removal Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successfulUsers.length > 0 && (
            <>
              <h5>Successfully Removed Users:</h5>
              <ListGroup style={{ maxHeight: '30vh', overflowY: 'auto', marginBottom: '1rem' }}>
                {successfulUsers.map((user, index) => (
                  <ListGroup.Item key={index} variant="success">{user}</ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
          {failedUsers.length > 0 && (
            <>
              <h5 className="mt-3">Failed to Remove Users:</h5>
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
          <Offcanvas.Title>How to Remove Users</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card className="mb-3">
            <Card.Header as="h5">Step 1: Prepare Your CSV File</Card.Header>
            <Card.Body>
              <Card.Text>
                Create a CSV file with the following required column:
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
                Ensure the 'userName' column is present and filled out correctly.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header as="h5">Step 3: Remove Users</Card.Header>
            <Card.Body>
              <Card.Text>
                After importing, review the data in the table.
              </Card.Text>
              <Card.Text>
                Click "Remove Users" to begin the user removal process.
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
                After the process completes, you'll see a summary of successful and failed user removals.
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

export default RemoveUser;