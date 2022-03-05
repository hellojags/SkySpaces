import { ChonkyActions, ChonkyFileActionData, FileData, FileHelper } from 'chonky';
import { useCallback } from 'react';
import { useFileManager, useSkynetManager } from '../../contexts';
import { showActionNotification } from '../utils/util';
import { CustomFileData , customFileActions} from './customization';

