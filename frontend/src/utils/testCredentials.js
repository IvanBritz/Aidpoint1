// Test credentials for development
// Use these to test the employee management functionality

export const testProjectDirector = {
  email: 'director@test.com',
  password: 'password123',
  token: '4|NvFy16GdK65BBLeVNmBwuhQINGQtKO14o49xW89xeb7f5357', // May need to be refreshed
  role: 'project_director'
};

// Function to quickly set test login data in localStorage
export const setTestLoginData = () => {
  localStorage.setItem('auth_token', testProjectDirector.token);
  localStorage.setItem('user_data', JSON.stringify({
    id: 3,
    name: 'Test Director',
    email: testProjectDirector.email,
    role: testProjectDirector.role
  }));
  console.log('Test login data set in localStorage');
};

// Function to clear login data
export const clearLoginData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  console.log('Login data cleared from localStorage');
};

// Quick login function for testing
export const quickLogin = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testProjectDirector.email,
        password: testProjectDirector.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      console.log('Quick login successful:', data.user.name);
      return data;
    } else {
      console.error('Quick login failed:', data);
      return null;
    }
  } catch (error) {
    console.error('Quick login error:', error);
    return null;
  }
};