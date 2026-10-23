import {createDefiantWorksheetCellResolver} from './defiant-worksheet-cells.js';
import {createDefiantGcsOpener} from './defiant-evidence-gcs.js';
import {createDefiantEvidenceLoader} from './defiant-evidence-loader.js';
import {createDefiantSourceRecordResolver} from './defiant-source-records.js';

/** Server-owned pins and exact organization only. Authentication remains with the host. */
export function createDefiantEvidenceProvider({organizationId, bucket, snapshotObject, sourcePartitions, worksheetPartitions, semanticIndexObject} = {}) {
 const openObject = createDefiantGcsOpener({bucket});
 const loadSnapshot = createDefiantEvidenceLoader({organizationId, object:snapshotObject, openObject});
 const loadSourceRecords = createDefiantSourceRecordResolver({organizationId, partitions:sourcePartitions, openObject});
 const loadWorksheetCells = worksheetPartitions === undefined ? undefined : createDefiantWorksheetCellResolver({organizationId,partitions:worksheetPartitions,openObject});
 const loadSemanticIndex=semanticIndexObject===undefined?undefined:createDefiantEvidenceLoader({organizationId,object:semanticIndexObject,openObject});
 const binding = Object.freeze({loadSnapshot, loadSourceRecords, ...(loadSemanticIndex?{loadSemanticIndex}:{}), ...(loadWorksheetCells ? {loadWorksheetCells} : {})});
 return ({organizationId:requested} = {}) => requested === organizationId ? binding : null;
}
