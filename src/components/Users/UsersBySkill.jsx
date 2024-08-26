import React, { useState, useContext, useMemo, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast } from 'react-bootstrap';
import { transformUsersWithSkillsResponse } from '../../utils';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

const UsersBySkill = () => {
  const { usersInfo, setUsersInfo, setUsername, username, apiRoute } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [tableData, setTableData] = useState([]);

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };
  
  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(tableData);
    download(csvConfig)(csv);
  };

  useEffect(() => {
    if (usersInfo && usersInfo?.data?.return?.length > 0) {
      setTableData(transformUsersWithSkillsResponse(usersInfo));
    }
  }, [usersInfo]);

  const fetchAllUsersInfo = async (PassedUsername, PassedPassword, rememberUsername) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiRoute}/api/users/getUsersInfo/`, {
        username: PassedUsername,
        password: PassedPassword,
      });

      const transformedData = transformUsersWithSkillsResponse(response);
      setTableData(transformedData);
      setUsersInfo(response);
      setUsername(rememberUsername ? PassedUsername : '');
      setError(null);

      handleLoginSuccess();
    } catch (error) {
      console.error('Error fetching users info:', error);
      setError('Failed to fetch users info');
      handleLoginError(error.response?.data?.message || 'Failed to fetch users info');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setToastMessage('Login successful and users info synced!');
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
    if (tableData && tableData.length > 0) {
      const priorityColumns = Object.keys(tableData[0])
        .filter(key => key.toLowerCase().includes('skill'))
        .map((key) => ({
          accessorKey: key,
          header: key.replace(/_/g, ' ').toUpperCase(),
          Cell: typeof tableData[0][key] === 'boolean' ? booleanCellRenderer : undefined,
        }));

      const remainingColumns = Object.keys(tableData[0])
        .filter(key => !key.toLowerCase().includes('skill'))
        .map((key) => ({
          accessorKey: key,
          header: key.replace(/_/g, ' ').toUpperCase(),
          Cell: typeof tableData[0][key] === 'boolean' ? booleanCellRenderer : undefined,
        }));

      return [...priorityColumns, ...remainingColumns];
    }
    return [];
  }, [tableData]);

  const table = useMaterialReactTable({
    columns,
    data: tableData || [],
    enableGrouping: true,
    groupedColumnMode: 'reorder',
    initialState: {
      expanded: true,
      grouping: [],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    muiTableContainerProps: { sx: { maxHeight: '800px' } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          onClick={handleExportData}
          starticon={<FileDownloadIcon />}
        >
          Export All Data
        </Button>
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() =>
            handleExportRows(table.getPrePaginationRowModel().rows)
          }
          starticon={<FileDownloadIcon />}
        >
          Export All Rows
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          starticon={<FileDownloadIcon />}
        >
          Export Page Rows
        </Button>
        <Button
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          starticon={<FileDownloadIcon />}
        >
          Export Selected Rows
        </Button>
      </Box>
    ),
  });

  return (
    <Container>
      <Row className="align-items-center mb-3">
        <Col xs={12} sm={6}>
          <h1>Users By Skill</h1>
        </Col>
        <Col xs={12} sm={6} className="text-right">
          <Button onClick={() => setShowLoginModal(true)}>Sync Users Info</Button>
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
          <Login username={username} endpoint={fetchAllUsersInfo} loading={loading} />
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

export default UsersBySkill;