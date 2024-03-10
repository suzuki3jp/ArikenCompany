import { Path } from '../constants/index';
import { Settings as SettingsT } from '../typings/index';
import { JSONManager } from './JSONManager';

export class SettingsManager extends JSONManager<SettingsT> {
    constructor() {
        super(Path.settings);
    }
}

export const settings = new SettingsManager();
