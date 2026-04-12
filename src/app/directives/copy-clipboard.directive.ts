import { Directive, HostListener, input, output } from "@angular/core";

@Directive({ selector: '[copy-clipboard]', standalone: true })
export class CopyClipboardDirective {

    payload = input<string>('', { alias: 'copy-clipboard' });

    copied = output<string>({ alias: 'copied' });

    @HostListener("click", ["$event"])
    public onClick(event: MouseEvent): void {

        event.preventDefault();
        if (!this.payload())
            return;

        let listener = (e: ClipboardEvent) => {
            let clipboard = e.clipboardData || (window as any)['clipboardData'];
            clipboard.setData("text", this.payload().toString());
            e.preventDefault();

            this.copied.emit(this.payload());
        };

        document.addEventListener("copy", listener, false)
        document.execCommand("copy");
        document.removeEventListener("copy", listener, false);
    }
}
