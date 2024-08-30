import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, Offcanvas } from 'react-bootstrap';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Papa from 'papaparse';

const RemoveUser = () => {
  const { setUsername, username, apiRoute } = useContext(AppContext);
  const [error, setError] = useState(null);
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

  const permittedColumns = [
    'userName',
  ];

  const removeUserInfo = async (PassedUsername, PassedPassword, rememberUsername, users) => {
    setLoading(true);
    setShowProgressModal(true);

    const successful = [];
    const failed = [];
    try {
      for (let i = 0; i < users.length; i++) {
        const userToRemove = users[i].userName;

        try {
          await axios.post(`${apiRoute}/api/users/removeUser/`, {
            loginUser: PassedUsername,
            password: PassedPassword,
            userName: userToRemove,
          });
          successful.push(userToRemove);
        } catch (error) {
          console.error(`Error removing user ${userToRemove}:`, error);
          failed.push(userToRemove);
        }
        setProgress(((i + 1) / users.length) * 100);
      }

      setProgress(0);

      setUsername(rememberUsername ? PassedUsername : '');
      setError(null);

      handleLoginSuccess(successful, failed);
    } catch (error) {
      console.error('Error removing users general info:', error);
      setError('Failed to remove users general info');
      handleLoginError(error.response?.data?.message || 'Failed to remove users general info');
    } finally {
      setLoading(false);
      setShowProgressModal(false);
    }
  };

  const handleLoginSuccess = (successful, failed) => {
    setShowLoginModal(false);
    const successMessage = successful.length > 0 ? `Successfully removed users:\n${successful.join('\n')}` : '';
    const failedMessage = failed.length > 0 ? `Failed to remove users:\n${failed.join('\n')}` : '';
    const combinedMessage = [successMessage, failedMessage].filter(Boolean).join('\n\n');
    setToastMessage(combinedMessage.replace(/\n/g, '<br />'));
    setShowSuccessToast(true);
  };

  const handleLoginError = (message) => {
    console.error(message);
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
    enableRowSelection: true,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvData([]);
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
          console.error('Error parsing CSV file:', error);
          setToastMessage('Failed to parse CSV file');
          setShowErrorToast(true);
          setIsRemoveUserButtonEnabled(false);
        },
      });
    }
  };

  const handleAddUserRemoveClick = () => {
    setShowLoginModal(true);
  };

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

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col xs={12} sm={12} lg={6}>
          <h1>Remove Users</h1>
        </Col>
        <Col xs={12} sm={12} lg={6} className="text-right">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="csvFileInput"
          />
          <label htmlFor="csvFileInput">
            <Button as="span">Import CSV</Button>
          </label>
          <Button
            variant="link"
            onClick={() => setShowOffcanvas(true)}
            aria-label="Help"
            style={{ marginLeft: '10px' }}
          >
            <i className="bi bi-question-circle"></i>
          </Button>
          <Button
            variant="primary"
            onClick={handleAddUserRemoveClick}
            disabled={!isRemoveUserButtonEnabled}
            style={{ marginLeft: '10px' }}
          >
            Remove Users
          </Button>
        </Col>
      </Row>
      {error && <p>{error}</p>}
      <div className='table-container' style={{ marginBottom: '5rem' }}>
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
        onHide={() => setShowProgressModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Processing Users</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}>{Math.round(progress)}%</div>
          </div>
        </Modal.Body>
      </Modal>

      <Toast
        onClose={() => setShowSuccessToast(false)}
        show={showSuccessToast}
        delay={3000}
        autohide={false}
        bg="primary-subtle"
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}
      >
        <Toast.Header>
          <strong className="me-auto">Info</strong>
        </Toast.Header>
        <Toast.Body style={{fontWeight: 'bolder'}} dangerouslySetInnerHTML={{ __html: toastMessage }} />
      </Toast>

      <Toast
        onClose={() => setShowErrorToast(false)}
        show={showErrorToast}
        delay={3000}
        bg="danger"
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}
      >
        <Toast.Header>
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Instructions</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p>Here are the instructions on how to use this page:</p>
          <ul>
            <li>Click on "Import CSV" to upload a CSV file.</li>
            <li>The CSV file must contain the required column: userName.</li>
            <li>The CSV file can only contain the following permitted columns:</li>
          </ul>
          <Button onClick={handleDownloadTemplate}>Download CSV Template</Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default RemoveUser;