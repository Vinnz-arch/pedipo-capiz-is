import { toast } from "sonner";

/**
 * Utility for showing toast notifications using Sonner.
 */
export const notify = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description: description,
    });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description,
    });
  },
  
  info: (message: string, description?: string) => {
    toast(message, {
      description: description,
    });
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description: description,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  }
};
