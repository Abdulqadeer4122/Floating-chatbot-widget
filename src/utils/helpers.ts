import Swal from 'sweetalert2';
import { useQuery, useQueryClient } from 'react-query';
import { colors } from './colors';
import '../containers/app/style.css';

// Types
interface ParamsObject {
  [key: string]: string | number | boolean;
}

interface ToastProps {
  icon: 'success' | 'error' | 'warning' | 'info' | 'question';
  title?: string;
  text?: string;
  [key: string]: any;
}

// insertParams
export function insertParams(params: ParamsObject): string {
  const str: string[] = [];
  const paramObj = { ...params };
  
  Object.keys(paramObj).forEach((key) => {
    const currentParam = paramObj[key];
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(currentParam))}`);
  });
  
  return str.join('&');
}

// REUSEABLE TOAST
export const Toast = ({ icon, ...props }: ToastProps): void => {
  mixin.fire({
    icon,
    background: colors.toastColors[icon],
    customClass: {
      title: 'toastTitleColor',
      container: `borderColor${icon}`,
    },
    ...props,
  });
};

const mixin = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 5000,
  width: 300,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

// REUSEABLE MODAL
export const Modal = Swal.mixin({
  title: 'Are you sure?',
  text: "You won't be able to revert this!",
  icon: 'warning',
  customClass: {
    popup: 'popup-class',
  },
  showCancelButton: true,
  confirmButtonColor: colors.primary,
  cancelButtonColor: colors.red,
  confirmButtonText: 'Yes, delete it!',
});

// USAGE;
// Modal({});

export function navigateTo(
  history: { push: (url: string) => void },
  url: string
): void {
  history.push(url);
}

export function useSharedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const queryClient = useQueryClient();
  
  const { data: state } = useQuery<T>(
    key,
    () => queryClient.getQueryData<T>(key),
    {
      initialData: initialValue,
    }
  );
  
  const setState = (value: T): void => {
    queryClient.setQueryData<T>(key, value);
  };
  
  return [state as T, setState];
}

export function isFunction(possibleFunction: any): boolean {
  return typeof possibleFunction === typeof Function;
}

export const capitalize = (string?: string): string => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const generateRandomId = (): string => {
  const randomNumber = Math.floor(Math.random() * 10000);
  const formattedNumber = randomNumber.toString().padStart(4, '0');
  return formattedNumber;
};