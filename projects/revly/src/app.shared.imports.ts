import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';

//be careful to not import anything that is not used by all the components
export const COMMON_IMPORTS = [MatButton, MatIcon, MatLabel, MatTooltip, MatInput] as const;
