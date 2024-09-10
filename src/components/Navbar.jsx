import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { House, People, PersonGear, Tools } from 'react-bootstrap-icons';

const NavbarComponent = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const handleClose = () => setExpanded(false);

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="light" variant="light" expand="lg" fixed="top" expanded={expanded} className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" onClick={handleClose} className="d-flex align-items-center">
          <Image
            alt="Data Transfer"
            src="exchange.svg"
            width="40"
            height="30"
            className="d-inline-block align-top me-2"
          />
          <span className="font-weight-bold">Five9 Dataloader</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
        <Navbar.Collapse id="basic-navbar-nav" data-testid="navbar-collapse">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" onClick={handleClose} active={isActive('/')}>
              <House className="me-1" /> Home
            </Nav.Link>
            <NavDropdown title={<><People className="me-1" /> Contacts</>} id="contacts-dropdown">
              <NavDropdown.Item as={Link} to="/contacts" onClick={handleClose} active={isActive('/contacts')}>
                Get all contacts
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={<><PersonGear className="me-1" /> Users</>} id="users-dropdown">
              <NavDropdown.Item as={Link} to="/create-user-info" onClick={handleClose} active={isActive('/create-user-info')}>
                Create users
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/update-user-info" onClick={handleClose} active={isActive('/update-user-info')}>
                Update users
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/remove-user-info" onClick={handleClose} active={isActive('/remove-user-info')}>
                Remove users
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/users-general-info" onClick={handleClose} active={isActive('/users-general-info')}>
                Get users info
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/users-by-skill" onClick={handleClose} active={isActive('/users-by-skill')}>
                Get users by skill
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title={<><Tools className="me-1" /> Skills</>} id="skills-dropdown">
              <NavDropdown.Item as={Link} to="/add-skills-to-user" onClick={handleClose} active={isActive('/add-skills-to-user')}>
                Add skill to user
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;