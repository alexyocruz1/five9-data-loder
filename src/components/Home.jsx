import React from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';

const Home = () => {
  const functions = [
    {
      name: 'Get all contacts',
      description: 'Fetches all contacts from the database.',
      requiresData: 'No',
    },
    {
      name: 'Get users general info',
      description: 'Fetches all users general info.',
      requiresData: 'No',
    },
    {
      name: 'Get users info by Skill',
      description: 'Fetches all users info with their skills.',
      requiresData: 'No',
    },
    {
      name: 'Update users general info',
      description: 'Updates general info from existing users on Five9 depending on CSV file.',
      requiresData: 'Yes',
    },
    {
      name: 'Add skills to user',
      description: 'Add skills to existing users on Five9 depending on CSV file.',
      requiresData: 'Yes',
    },
    {
      name: 'Remove user',
      description: 'Remove existing users from five9.',
      requiresData: 'Yes',
    }
  ];

  const pendingPatches = [
    {
      title: 'Remember username',
      bug: 'The username is not being stored nor remembered when a user clicks on the checkbox when it confirms the credentials.',
    },
    {
      title: 'CSV templates',
      bug: 'Templates are only available for the create user function and need to be added to the update user and add skill to user.',
    },
    {
      title: 'Submitting CSV',
      bug: 'Theres a bug in which if the user have already uploaded a csv file and upload another version of the file with the same name, the table does not get updates.',
    },
    {
      title: 'Navbar',
      bug: 'Navigation bar should close if the user clicks outside it.',
    },
    {
      title: 'Error display',
      bug: 'Erros coming from Five9 need to be displayed for user instead of standard ones.',
    },
    {
      title: 'Progress Bar',
      bug: 'Progress bar when processing multiple records need to be fixed to visually finish before it disappears, also it have to be cleaned after it completes.',
    },
  ];

  return (
    <Container>
      <Row>
        <Col>
          <h1 style={{textAlign: 'center', marginBottom: '2.5rem'}}>Welcome to Five9 Dataloader</h1>
          <p>Available endpoints and their usage can be found below.</p>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Function</th>
                <th>Description</th>
                <th>Requires Data</th>
              </tr>
            </thead>
            <tbody>
              {functions.map((func, index) => (
                <tr key={index}>
                  <td>{func.name}</td>
                  <td>{func.description}</td>
                  <td>{func.requiresData}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row style={{marginTop: '2.5rem', marginBottom: '2.5rem'}}>
        <Col>
          <p>Pending patches</p>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Bug</th>
              </tr>
            </thead>
            <tbody>
              {pendingPatches.map((patch, index) => (
                <tr key={index}>
                  <td>{patch.title}</td>
                  <td>{patch.bug}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;