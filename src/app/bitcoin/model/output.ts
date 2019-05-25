import { LockedToRelation } from './lockedtorelation';
import { InputRelation} from './inputrelation';
import { OutputRelation } from './outputrelation';

export interface Output {

	outputId: string;
	value: number;
	
	producedByTransaction: OutputRelation;

	inputsTransaction: InputRelation;

	lockedToAddress: LockedToRelation;
}