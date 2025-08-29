'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PasswordChangeModal from './PasswordChangeModal';

interface PasswordChangeWrapperProps {
  children: React.ReactNode;
}

const PasswordChangeWrapper: React.FC<PasswordChangeWrapperProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.must_change_password) {
      setShowPasswordChangeModal(true);
    }
  }, [isAuthenticated, user?.must_change_password]);

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeModal(false);
  };

  return (
    <>
      {children}
      <PasswordChangeModal
        isOpen={showPasswordChangeModal}
        onClose={() => {}} // Cannot close if forced
        onSuccess={handlePasswordChangeSuccess}
        forced={true}
      />
    </>
  );
};

export default PasswordChangeWrapper;