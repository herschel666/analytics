export const init = (btn: HTMLButtonElement): void => {
  const hostname = btn.dataset.hostname;
  const form = btn.form;
  const message = `Please confirm the deletion by typing the hostname "${hostname}" into the field below.`;

  btn.addEventListener('click', () => {
    if (prompt(message) === hostname) {
      form.submit();
    }
  });
};
