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
      name: 'Add skills to user',
      description: 'Add skills to existing users.',
      requiresData: 'Yes',
    }
  ];

  return (
    <Container>
      <Row>
        <Col>
          <h1>Welcome to Five9 Dataloader</h1>
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
    </Container>
  );
};

export default Home;