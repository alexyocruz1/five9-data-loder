import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavbarComponent = () => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);
  const handleClose = () => setExpanded(false);

  return (
    <Navbar bg="light" variant="light" expand="lg" fixed="top" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={handleClose}>
            <img
              alt="Data Transfer"
              src="exchange.svg"
              width="40"
              height="30"
              className="d-inline-block align-top"
            />{' '}
          Five9 Dataloader</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggle} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleClose}>Home</Nav.Link>
            <NavDropdown title="Contacts" id="basic-nav-dropdown">
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/contacts" onClick={handleClose}>Get all contacts</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Users" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/update-user-info" onClick={handleClose}>Update users general info</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/users-general-info" onClick={handleClose}>Get users general info</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/users-by-skill" onClick={handleClose}>Get users by skill</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Skills" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/add-skills-to-user" onClick={handleClose}>Add skill to user</NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;