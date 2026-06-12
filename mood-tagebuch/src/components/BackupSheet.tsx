import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { useToast } from './toast-context';
import { downloadBackup, importData } from '../db/backup';
import { estimateStorage, requestPersistentStorage } from '../lib/storage';

/** Bottom sheet with data backup actions, opened from the Heute avatar. */
export function BackupSheet({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [usage, setUsage] = useState<string | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
    estimateStorage().then((e) => {
      if (e) setUsage(`${(e.usage / 1024).toFixed(0)} KB belegt`);
    });
  }, []);

  async function handleExport() {
    await downloadBackup();
    toast.show('Sicherung exportiert ✓');
  }

  async function handleFile(file: File) {
    try {
      await importData(await file.text());
      toast.show('Daten wiederhergestellt ✓');
      onClose();
      // reload so all screens pick up the imported data
      setTimeout(() => window.location.reload(), 400);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Import fehlgeschlagen');
    }
  }

  async function enablePersist() {
    const ok = await requestPersistentStorage();
    setPersisted(ok);
    toast.show(ok ? 'Dauerhafter Speicher aktiv ✓' : 'Nicht verfügbar');
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.28)',
        zIndex: 45,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-card)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: '20px 22px calc(24px + var(--safe-bottom))',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 600 }}>Daten & Sicherung</span>
          <button onClick={onClose} style={{ fontSize: 14, color: 'var(--color-muted)' }}>
            Fertig
          </button>
        </div>

        <SheetButton icon="download" label="Sicherung exportieren" sub="Alle Daten als JSON-Datei" onClick={handleExport} />
        <SheetButton
          icon="upload"
          label="Sicherung importieren"
          sub="Ersetzt alle aktuellen Daten"
          onClick={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />

        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid var(--color-border)',
            fontSize: 12,
            color: 'var(--color-muted)',
            lineHeight: 1.6,
          }}
        >
          {persisted === true ? (
            <>Dauerhafter Speicher ist aktiv. {usage}</>
          ) : (
            <>
              Daten liegen nur auf diesem Gerät.{' '}
              <button onClick={enablePersist} style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                Dauerhaften Speicher aktivieren
              </button>
              {usage ? ` · ${usage}` : ''}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SheetButton({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: 'download' | 'upload';
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        marginBottom: 8,
        borderRadius: 12,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          background: 'var(--color-accent-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={16} color="var(--color-accent)" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 1 }}>{sub}</div>
      </div>
    </button>
  );
}
