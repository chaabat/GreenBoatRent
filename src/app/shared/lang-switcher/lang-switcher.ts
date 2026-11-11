import { Component, ElementRef, computed, inject, signal } from '@angular/core';

export type Lang = 'it' | 'en' | 'fr';

interface LangOption {
  code: Lang;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-lang-switcher',
  templateUrl: './lang-switcher.html',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'open.set(false)'
  }
})
export class LangSwitcher {
  private el = inject(ElementRef);

  languages: LangOption[] = [
    { code: 'it', label: 'Italiano', flag: 'flags/it.svg' },
    { code: 'en', label: 'English',  flag: 'flags/en.svg' },
    { code: 'fr', label: 'Français', flag: 'flags/fr.svg' }
  ];

  open = signal(false);
  lang = signal<Lang>(this.loadLang());
  current = computed(() => this.languages.find(l => l.code === this.lang())!);

  toggle() { this.open.update(v => !v); }

  select(code: Lang) {
    this.lang.set(code);
    this.open.set(false);
    try { localStorage.setItem('lang', code); } catch {}
    // ngx-translate will be connected here later
  }

  onDocumentClick(e: Event) {
    if (!this.el.nativeElement.contains(e.target)) this.open.set(false);
  }

  private loadLang(): Lang {
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'it' || saved === 'en' || saved === 'fr') return saved;
    } catch {}
    return 'it';
  }
}