import * as Bluebird from 'bluebird';

export interface Renderer {

    render<C>(view: string, context: C): Bluebird<View>

}

export interface View {

    content: string;
    contentType?: string;

}

