import React, { useState, useEffect } from 'react';
import { useGlobalState } from '@/app/AppProviders';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, currentUser } = useGlobalState();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
    }
  }, [currentUser]);

  // If already logged in, don't show, but also ensure parent controls visibility via isOpen
  if (currentUser && isOpen) {
    onClose();
    return null;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    try {
      await login(email, password, name);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={loading}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => handleSubmit()}
        disabled={loading || !email || !password}
        isLoading={loading}
        className="flex-1"
      >
        Sign In
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Login Required"
      description="Please sign in to continue."
      footer={footer}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Name (Optional)"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        {/* Hidden submit button to enable Enter key submission */}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};
