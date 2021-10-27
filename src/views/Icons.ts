import * as path from 'path';

const resources = path.join(__filename, '..', '..', 'resources');

export const packageIcon = (() => {
  const paths = {
    light: path.join(resources, 'light', 'dep.svg'),
    dark: path.join(resources, 'dark', 'dep.svg'),
  };

  console.log({ paths });

  return paths;
})();

export const packageUpdateIcon = {
  light: path.join(resources, 'light', 'dep-update.svg'),
  dark: path.join(resources, 'dark', 'dep-update.svg'),
};

export const projectIcon = {
  light: path.join(resources, 'light', 'file-directory.svg'),
  dark: path.join(resources, 'dark', 'file-directory.svg'),
};
