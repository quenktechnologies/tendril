import * as Bluebird from 'bluebird';
export interface View {
    content: string;
    contentType: string;
}
export interface Renderer {
    render<C>(view: string, context: C): Bluebird<View>;
}
