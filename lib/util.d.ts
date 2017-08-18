export interface Promie<A> {
    then<B>(f: (a: A) => B): B;
    catch<B>(f: (e: Error) => B): B;
}
