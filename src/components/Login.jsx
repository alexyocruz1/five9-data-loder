import React, { useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = ({ username, endpoint, loading }) => {
  const [rememberUsername, setRememberUsername] = useState(false);

  const handleSubmit = (values) => {
    endpoint(values.username, values.password, rememberUsername);
  }

  return (
    <Container fluid className="d-flex">
      <Row className="m-auto align-self-center w-100">
        <Col className="mx-auto">
          <Formik
            validationSchema={schema}
            onSubmit={handleSubmit}
            initialValues={{
              username: username || '',
              password: '',
            }}
          >
            {({ handleSubmit, handleChange, values, touched, errors }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md="12" controlId="validationFormikUsername">
                    <Form.Label>Username</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text id="inputGroupPrepend">@</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Username"
                        aria-describedby="inputGroupPrepend"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        isInvalid={!!errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md="12" controlId="validationFormikPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md="12" controlId="validationFormikRememberUsername">
                    <Form.Check
                      type="checkbox"
                      label="Remember my username"
                      checked={rememberUsername}
                      onChange={(e) => setRememberUsername(e.target.checked)}
                    />
                  </Form.Group>
                </Row>
                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Loading...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;