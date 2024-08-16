import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast } from 'react-bootstrap';
import { transformResponse } from '../utils';
import Login from './Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

const Contacts = () => {
  const { contacts, setContacts, setUsername, username, apiRoute } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchAllContacts = async (PassedUsername, PassedPassword, rememberUsername) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiRoute}/api/contacts/getContactRecordsAll/`, {
        username: PassedUsername,
        password: PassedPassword,
      });
      setContacts(transformResponse(response));
      setUsername(rememberUsername ? PassedUsername : '');

      handleLoginSuccess();
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
      handleLoginError(error.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setToastMessage('Login successful and contacts synced!');
    setShowSuccessToast(true);
  };

  const handleLoginError = (message) => {
    console.error(message);
    setToastMessage(message);
    setShowErrorToast(true);
  };

  const columns = useMemo(() => {
    if (contacts && contacts.length > 0) {
      return Object.keys(contacts[0]).map((key) => ({
        accessorKey: key,
        header: key.replace(/_/g, ' ').toUpperCase(),
      }));
    }
    return [];
  }, [contacts]);

  const table = useMaterialReactTable({
    columns,
    data: contacts || [],
  });

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col xs={5} sm={4}>
          <h1>Contacts</h1>
        </Col>
        <Col xs={7} sm={8} className="text-right">
          <Button onClick={() => setShowLoginModal(true)}>Sync Contacts</Button>
        </Col>
      </Row>
      {error && <p>{error}</p>}
      <MaterialReactTable table={table} />

      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Login username={username} fetchAllContacts={fetchAllContacts} loading={loading} />
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
    </Container>
  );
};

export default Contacts;