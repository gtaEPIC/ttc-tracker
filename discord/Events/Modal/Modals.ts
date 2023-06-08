export default abstract class Modals {
    abstract modalName: string;

    abstract execute(interaction, args);
}