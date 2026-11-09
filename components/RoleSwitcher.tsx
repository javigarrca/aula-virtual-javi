'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function RoleSwitcher() {
  const [role, setRole] = useState<'admin' | 'student'>('admin');

  useEffect(() => {
    const stored = localStorage.getItem('aula-virtual-role');
    if (stored === 'admin' || stored === 'student') {
      setRole(stored);
    }
  }, []);

  const handleRole = (nextRole: 'admin' | 'student') => {
    localStorage.setItem('aula-virtual-role', nextRole);
    setRole(nextRole);
  };

  return (
    <div className="role-box">
      <div className="role-toggle">
        <button
          className={role === 'admin' ? 'active' : ''}
          onClick={() => handleRole('admin')}
        >
          Administrador
        </button>
        <button
          className={role === 'student' ? 'active' : ''}
          onClick={() => handleRole('student')}
        >
          Alumno
        </button>
      </div>

      <Link href="/dashboard" className="primary-button">
        Entrar al aula
      </Link>
    </div>
  );
}
