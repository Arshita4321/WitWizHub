import toast from 'react-hot-toast';

export const handleSuccess = (msg) => {
  toast.success(msg, { 
    style: { background: '#10B981', color: '#fff' },
    position: 'top-right'
  });
};

export const handleError = (msg) => {
  toast.error(msg, { 
    style: { background: '#EF4444', color: '#fff' },
    position: 'top-right'
  });
};