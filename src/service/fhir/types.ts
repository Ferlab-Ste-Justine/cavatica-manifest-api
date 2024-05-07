export type FhirLink = {
    relation: string;
    url: string;
};

export type FhirOutput = {
    resourceType: string;
    id: string;
    meta: { lastUpdated: string };
    type: string;
    total: number;
    link: FhirLink[];
    entry: FhirEntry[];
};

export type FhirEntryContent = {
    attachment: {
        extension?: unknown[];
        url: string;
        title?: string;
    };
};

export type FhirEntry = {
    fullUrl: string;
    resource: {
        resourceType: string;
        id: string;
        meta: unknown;
        identifier: unknown[];
        status: string;
        docStatus: string;
        type: unknown;
        category: unknown[];
        subject: unknown;
        securityLabel: unknown[];
        content: FhirEntryContent[];
        context: unknown;
    };
    search: { mode: string };
};
