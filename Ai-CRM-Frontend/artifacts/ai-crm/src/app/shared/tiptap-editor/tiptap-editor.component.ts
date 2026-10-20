import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

@Component({
  selector: 'app-tiptap-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tiptap-wrapper">
      <div class="tiptap-toolbar">

        <!-- Gras -->
        <button type="button"
          (click)="editor!.chain().focus().toggleBold().run()"
          [class.active]="editor!.isActive('bold')"
          title="Gras">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          </svg>
        </button>

        <!-- Italique -->
        <button type="button"
          (click)="editor!.chain().focus().toggleItalic().run()"
          [class.active]="editor!.isActive('italic')"
          title="Italique">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="19" y1="4" x2="10" y2="4"/>
            <line x1="14" y1="20" x2="5" y2="20"/>
            <line x1="15" y1="4" x2="9" y2="20"/>
          </svg>
        </button>

        <!-- Barré -->
        <button type="button"
          (click)="editor!.chain().focus().toggleStrike().run()"
          [class.active]="editor!.isActive('strike')"
          title="Barré">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 6.4 3.9h.1"/>
            <path d="M10.5 20c3.5 0 6.5-1.5 6.5-4.3 0-1.8-1.1-3.3-4.8-4.1h-1.4"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
          </svg>
        </button>

        <div class="tiptap-sep"></div>

        <!-- H1 -->
        <button type="button"
          (click)="editor!.chain().focus().toggleHeading({level:1}).run()"
          [class.active]="editor!.isActive('heading', {level:1})"
          title="Titre H1"
          style="font-size:12px;font-weight:700;letter-spacing:-0.5px;">
          H<sub style="font-size:9px">1</sub>
        </button>

        <!-- H2 -->
        <button type="button"
          (click)="editor!.chain().focus().toggleHeading({level:2}).run()"
          [class.active]="editor!.isActive('heading', {level:2})"
          title="Titre H2"
          style="font-size:12px;font-weight:700;letter-spacing:-0.5px;">
          H<sub style="font-size:9px">2</sub>
        </button>

        <div class="tiptap-sep"></div>

        <!-- Liste à puces -->
        <button type="button"
          (click)="editor!.chain().focus().toggleBulletList().run()"
          [class.active]="editor!.isActive('bulletList')"
          title="Liste à puces">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="9" y1="6" x2="20" y2="6"/>
            <line x1="9" y1="12" x2="20" y2="12"/>
            <line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </button>

        <!-- Liste numérotée -->
        <button type="button"
          (click)="editor!.chain().focus().toggleOrderedList().run()"
          [class.active]="editor!.isActive('orderedList')"
          title="Liste numérotée">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="10" y1="6" x2="21" y2="6"/>
            <line x1="10" y1="12" x2="21" y2="12"/>
            <line x1="10" y1="18" x2="21" y2="18"/>
            <path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M4 10h2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>

        <div class="tiptap-sep"></div>

        <!-- Citation -->
        <button type="button"
          (click)="editor!.chain().focus().toggleBlockquote().run()"
          [class.active]="editor!.isActive('blockquote')"
          title="Citation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        </button>

        <!-- Séparateur horizontal -->
        <button type="button"
          (click)="editor!.chain().focus().setHorizontalRule().run()"
          title="Séparateur">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
          </svg>
        </button>

        <!-- Image -->
        <button type="button"
          (click)="imageFileInput.click()"
          title="Insérer une image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <input #imageFileInput type="file" accept="image/*" style="display:none" (change)="onImageSelected($event)"/>

        <div class="tiptap-sep"></div>

        <!-- Annuler -->
        <button type="button"
          (click)="editor!.chain().focus().undo().run()"
          title="Annuler">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>

        <!-- Rétablir -->
        <button type="button"
          (click)="editor!.chain().focus().redo().run()"
          title="Rétablir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
          </svg>
        </button>

      </div>
      <div #editorEl class="tiptap-content"></div>
    </div>
  `,
  styleUrls: ['./tiptap-editor.component.css']
})
export class TiptapEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorEl', { static: true }) editorEl!: ElementRef;
  @Input() content = '';
  @Input() placeholder = 'Écrivez votre message ici...';
  @Output() contentChange = new EventEmitter<string>();

  editor?: Editor;

  ngOnInit() {
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: this.placeholder }),
        Image.configure({ HTMLAttributes: { style: 'max-width:100%;border-radius:8px' } })
      ],
      content: this.content,
      onUpdate: ({ editor }) => {
        this.contentChange.emit(editor.getHTML());
      }
    });
  }

  insertText(text: string) {
    this.editor?.chain().focus().insertContent(text).run();
  }

  insertImage(src: string) {
    this.editor?.chain().focus().setImage({ src }).run();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.insertImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  ngOnDestroy() {
    this.editor?.destroy();
  }
}