import React, { useState } from 'react';
import { Button, Form, InputGroup, Spinner, Card, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import { PersonFill, LockFill, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const schema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const Login = ({ username, endpoint, loading }) => {
  const [rememberUsername, setRememberUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (values) => {
    endpoint(values.username, values.password, rememberUsername);
  }

  return (
    <div className="p-3"> {/* Add padding here */}
      <Card className="shadow">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Login</h2>
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
                <Form.Group className="mb-3" controlId="validationFormikUsername">
                  <Form.Label>Username</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <PersonFill />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      name="username"
                      value={values.username}
                      onChange={handleChange}
                      isInvalid={touched.username && !!errors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="validationFormikPassword">
                  <Form.Label>Password</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <LockFill />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      isInvalid={touched.password && !!errors.password}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="validationFormikRememberUsername">
                  <Form.Check
                    type="checkbox"
                    label="Remember my username"
                    checked={rememberUsername}
                    onChange={(e) => setRememberUsername(e.target.checked)}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
      {loading && (
        <Alert variant="info" className="mt-3">
          Please wait while we process your request...
        </Alert>
      )}
    </div>
  );
};

export default Login;