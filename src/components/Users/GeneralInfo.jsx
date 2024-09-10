import React, { useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { Button, Modal, Container, Row, Col, Toast, ButtonGroup } from 'react-bootstrap';
import { Download, ArrowRepeat } from 'react-bootstrap-icons';
import { transformUsersGeneralResponse } from '../../utils';
import Login from '../Login';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { MRT_TablePagination } from 'material-react-table';
import { useMediaQuery } from '@mui/material';

const GeneralInfo = () => {
  const { usersGeneralInfo, setUsersGeneralInfo, setUsername, username, apiRoute } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isTabletOrMobile = useMediaQuery('(max-width:991px)');

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
    if (usersGeneralInfo && usersGeneralInfo.length > 0) {
      const csv = generateCsv(csvConfig)(usersGeneralInfo);
      download(csvConfig)(csv);
    }
  };

  const fetchAllUsers = async (PassedUsername, PassedPassword, rememberUsername) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiRoute}/api/users/getUsersGeneralInfo/`, {
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

  const booleanCellRenderer = ({ cell }) => {
    return cell.getValue() ? 'Yes' : 'No';
  };

  const columns = useMemo(() => {
    if (usersGeneralInfo && usersGeneralInfo.length > 0) {
      return Object.keys(usersGeneralInfo[0]).map((key) => ({
        accessorKey: key,
        header: key.replace(/_/g, ' ').toUpperCase(),
        Cell: typeof usersGeneralInfo[0][key] === 'boolean' ? booleanCellRenderer : undefined,
      }));
    }
    return [];
  }, [usersGeneralInfo]);

  const table = useMaterialReactTable({
    columns,
    data: usersGeneralInfo || [],
    enableRowSelection: true,
    columnFilterDisplayMode: 'popover',
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    layoutMode: 'grid',
    renderTopToolbarCustomActions: ({ table }) => {
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
        </ButtonGroup>
      );
    },
    muiTableContainerProps: {
      sx: { maxHeight: '800px' },
    },
    renderBottomToolbar: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
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
          {table.getPrePaginationRowModel().rows.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: isTabletOrMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              alignItems: isTabletOrMobile ? 'flex-start' : 'center',
              width: '100%',
              gap: isTabletOrMobile ? '0.5rem' : '0'
            }}>
              <span>{`${selectedRows.length} row(s) selected`}</span>
              {selectedRows.length > 0 && (
                <Button variant="outline-secondary" size="sm" onClick={() => table.resetRowSelection()}>
                  Clear Selection
                </Button>
              )}
            </div>
          )}
        </div>
      );
    },
    enableRowSelectionToolbar: false,
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