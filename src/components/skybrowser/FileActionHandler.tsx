import { ChonkyActions, ChonkyFileActionData, FileData, FileHelper } from '@skynethubio/web3-file-explorer';
import { useCallback } from 'react';
import { useFileManager, useSkynetManager } from '../../contexts';
import { showActionNotification } from '../utils/util';
import { CustomFileData , customFileActions} from './customization';

