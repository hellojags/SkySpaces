import { Icon } from '@iconify/react';
import imageOutline from '@iconify/icons-eva/image-outline';
import peopleOutline from '@iconify/icons-eva/people-outline';
import folderOutline from '@iconify/icons-eva/folder-outline';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import historyOutline from '@iconify/icons-ant-design/history-outline';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'My Files',
    path: '/home/filemanager', 
    icon: getIcon(folderOutline)
  },
  {
    title: 'Recent',
    path: '/home/user',
    icon: getIcon(historyOutline)
  },
  {
    title: 'Photos',
    path: '/home/photos',
    icon: getIcon(imageOutline)
  },
  {
    title: 'Shared',
    path: '/home/products',
    icon: getIcon(peopleOutline)
  },
  {
    title: 'Recycle bin',
    path: '/home/blog',
    icon: getIcon(trash2Outline)
  }
];

export default sidebarConfig;
