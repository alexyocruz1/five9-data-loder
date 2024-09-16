import React from 'react';
import { Container, Row, Col, Card, Badge, Accordion } from 'react-bootstrap';
import { PersonPlus, ArrowClockwise, PersonX, Tools, ExclamationTriangle, List } from 'react-bootstrap-icons';

const Home = () => {
  const functions = [
    {
      name: 'Get all contacts',
      description: 'Fetches all contacts from the database.',
      requiresData: false,
      icon: <PersonPlus />,
    },
    {
      name: 'Get users general info',
      description: 'Fetches all users general info.',
      requiresData: false,
      icon: <PersonPlus />,
    },
    {
      name: 'Get users info by Skill',
      description: 'Fetches all users info with their skills.',
      requiresData: false,
      icon: <Tools />,
    },
    {
      name: 'Create user',
      description: 'Create new users on Five9 depending on CSV file.',
      requiresData: true,
      icon: <PersonPlus />,
    },
    {
      name: 'Update users general info',
      description: 'Updates general info from existing users on Five9 depending on CSV file.',
      requiresData: true,
      icon: <ArrowClockwise />,
    },
    {
      name: 'Add skills to user',
      description: 'Add skills to existing users on Five9 depending on CSV file.',
      requiresData: true,
      icon: <Tools />,
    },
    {
      name: 'Remove user',
      description: 'Remove existing users from five9.',
      requiresData: true,
      icon: <PersonX />,
    },
    {
      name: 'General Skills',
      description: 'View and manage general skills in the system.',
      requiresData: false,
      icon: <List />,
    }
  ];

  const pendingPatches = [
    {
      title: 'Remember username',
      bug: 'The username is not being stored nor remembered when a user clicks on the checkbox when it confirms the credentials.',
    },
  ];

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">Welcome to Five9 Dataloader</h1>
          <p className="text-center lead">Manage your Five9 data efficiently with our comprehensive tools.</p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="mb-4">Available Functions</h2>
          <Row xs={1} md={2} lg={3} className="g-4">
            {functions.map((func, index) => (
              <Col key={index}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center mb-3">
                      <span className="me-2">{func.icon}</span>
                      {func.name}
                    </Card.Title>
                    <Card.Text>{func.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer className="bg-transparent">
                    <Badge bg={func.requiresData ? "warning" : "success"}>
                      {func.requiresData ? "Requires Data" : "No Data Required"}
                    </Badge>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="mb-4">Pending Patches <ExclamationTriangle className="text-warning" /></h2>
          <Accordion>
            {pendingPatches.map((patch, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>{patch.title}</Accordion.Header>
                <Accordion.Body>{patch.bug}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;