import { Directive, ElementRef, AfterViewChecked, inject } from '@angular/core';

@Directive({
    selector: '[appScrollToBottom]'
})
export class ScrollToBottomDirective implements AfterViewChecked {
    private el = inject(ElementRef);

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        try {
            this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
        } catch (err) {
            
        }
    }
}
