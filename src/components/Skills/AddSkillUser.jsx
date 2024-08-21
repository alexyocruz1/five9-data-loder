import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, Offcanvas } from 'react-bootstrap';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import Papa from 'papaparse';

const AddSkillUser = () => {
  const { setUsername, username, apiRoute } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [csvData, setCsvData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isAddSkillsButtonEnabled, setIsAddSkillsButtonEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const addSkillsToUser = async (PassedUsername, PassedPassword, rememberUsername, skills) => {
    setLoading(true);
    setShowProgressModal(true);
    try {
      for (let i = 0; i < skills.length; i++) {
        const userSkill = skills[i];
        await axios.post(`${apiRoute}/api/skills/addSkillToUser/`, {
          username: PassedUsername,
          password: PassedPassword,
          userSkill: userSkill // Ensure the key matches the expected structure
        });
        setProgress(((i + 1) / skills.length) * 100);
      }

      setUsername(rememberUsername ? PassedUsername : '');
      setError(null);

      handleLoginSuccess();
    } catch (error) {
      console.error('Error adding skills to user:', error);
      setError('Failed to add skills to user');
      handleLoginError(error.response?.data?.message || 'Failed to add skills to user');
    } finally {
      setLoading(false);
      setShowProgressModal(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setToastMessage('Skills added successfully!');
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
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const requiredColumns = ['id', 'level', 'skillName', 'userName'];
          const csvColumns = Object.keys(results.data[0]);
          const hasRequiredColumns = requiredColumns.every((col) => csvColumns.includes(col));

          if (hasRequiredColumns) {
            const filteredData = results.data.filter(row => Object.values(row).some(value => value !== null && value !== ''));
            setCsvData(filteredData);
            setIsAddSkillsButtonEnabled(true);
          } else {
            setToastMessage('CSV file must contain the following columns: id, level, skillName, userName');
            setShowErrorToast(true);
            setIsAddSkillsButtonEnabled(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV file:', error);
          setToastMessage('Failed to parse CSV file');
          setShowErrorToast(true);
          setIsAddSkillsButtonEnabled(false);
        },
      });
    }
  };

  const handleAddSkillsClick = () => {
    setShowLoginModal(true);
  };

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col xs={12} sm={6}>
          <h1>Users General Info</h1>
        </Col>
        <Col xs={12} sm={6} className="text-right">
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
            onClick={handleAddSkillsClick}
            disabled={!isAddSkillsButtonEnabled}
            style={{ marginLeft: '10px' }}
          >
            Add Skills to Users
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
          <Login username={username} endpoint={(username, password, rememberUsername) => addSkillsToUser(username, password, rememberUsername, csvData)} loading={loading} />
        </Modal.Body>
      </Modal>

      <Modal
        show={showProgressModal}
        onHide={() => setShowProgressModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Processing Skills</Modal.Title>
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
        autohide
        bg="success"
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}
      >
        <Toast.Header>
          <strong className="me-auto">Success</strong>
        </Toast.Header>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Toast
        onClose={() => setShowErrorToast(false)}
        show={showErrorToast}
        delay={3000}
        autohide
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
            <li>The CSV file must contain the following columns: id, level, skillName, userName.</li>
          </ul>
          <h5>CSV Format Example:</h5>
          <table className="table">
            <thead>
              <tr>
                <th>id</th>
                <th>level</th>
                <th>skillName</th>
                <th>userName</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Expert</td>
                <td>JavaScript</td>
                <td>JohnDoe</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Intermediate</td>
                <td>React</td>
                <td>JaneDoe</td>
              </tr>
            </tbody>
          </table>
        </Offcanvas.Body>
      </Offcanvas>
    </Container>
  );
};

export default AddSkillUser;