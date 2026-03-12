import Swal from "sweetalert2";

export const showSuccess = (message, title = "Success") => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const showError = (message, title = "Error") => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
  });
};

export const showWarning = (message, title = "Warning") => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
  });
};

export const showConfirm = (message, title = "Are you sure?") => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });
};
