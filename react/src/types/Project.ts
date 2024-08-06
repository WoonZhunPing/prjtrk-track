
export type Project = {
    projectKey: number,
    projectCode: string,
    projectName: string,
    projectDesc?: string,
    projectValue: number,
    targetHour: number,
    targetCost: number,
    startDate: Date,
    endDate: Date,
    createdBy?: number,
    createdDate?: Date,
    updatedBy?: number,
    updatedDate?: Date
};
