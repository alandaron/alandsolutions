import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx as spSPFx } from '@pnp/sp';
import { graphfi, GraphFI, SPFx as graphSPFx } from '@pnp/graph';
import { LogLevel, PnPLogging } from '@pnp/logging';

import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

let _sp: SPFI | undefined = undefined;
let _graph: GraphFI | undefined = undefined;

export const getSP = (context: WebPartContext): SPFI => {
    if (context === null) {
        throw new Error('Context is null');
    }
    _sp = spfi().using(spSPFx(context)).using(PnPLogging(LogLevel.Warning));
    return _sp;
};

export const getGraph = (context: WebPartContext): GraphFI => {
    if (context === null) {
        throw new Error('Context is null');
    }
    _graph = graphfi().using(graphSPFx(context)).using(PnPLogging(LogLevel.Warning));
    return _graph;
};
