import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneDropdown } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'QuarterlyViewWebPartStrings';
import QuarterlyView from './components/QuarterlyView';
import { IQuarterlyViewProps } from './components/IQuarterlyViewProps';
import QuarterlyViewApi from './QuarterlyViewApi';
import { IListInfo } from '@pnp/sp/lists';

export interface IQuarterlyViewWebPartProps {
    api: string;
    taskListId: string;
}

export default class QuarterlyViewWebPart extends BaseClientSideWebPart<IQuarterlyViewWebPartProps> {
    private quarterlyViewApi: QuarterlyViewApi;
    private lists: IListInfo[];

    public render(): void {
        const element: React.ReactElement<IQuarterlyViewProps> = React.createElement(QuarterlyView, {
            api: this.quarterlyViewApi
        });

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        this.quarterlyViewApi = new QuarterlyViewApi(this.context);
        this.lists = await this.quarterlyViewApi.getLists();

        if (this.properties.taskListId) {
            this.quarterlyViewApi.taskListId = this.properties.taskListId;
        }
        return super.onInit();
    }

    protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
        if (propertyPath === 'taskListId' && oldValue !== newValue) {
            this.quarterlyViewApi.taskListId = this.properties.taskListId;
        }
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupFields: [
                                PropertyPaneDropdown('taskListId', {
                                    label: strings.TaskListFieldLabel,
                                    options: this.lists.map((list) => ({
                                        key: list.Id,
                                        text: list.Title
                                    })),
                                    selectedKey: this.properties.taskListId
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
