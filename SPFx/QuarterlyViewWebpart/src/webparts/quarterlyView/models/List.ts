export interface IGenericList {
    name: string;
    url: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IDocumentLibrary extends IGenericList {}

export class GenericList implements IGenericList {
    public name: string;

    public get url(): string {
        return 'lists/' + this.name;
    }

    constructor(name: string) {
        this.name = name;
    }
}

export class DocumentLibrary implements IDocumentLibrary {
    public name: string;

    public get url(): string {
        return this.name;
    }

    constructor(name: string) {
        this.name = name;
    }
}
