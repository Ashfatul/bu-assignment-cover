"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { defaultSettings, defaultState } from "@/config/defaults";
import {
  DEFAULT_FIELD_LABELS,
  type CoverData,
  type CoverSettings,
  type CoverState,
  type FieldKey,
  type GroupMember,
} from "@/lib/schema";

import { validateCoverData, type SectionKey, type ValidationReport } from "@/lib/validation";

type DataSection = keyof CoverData;
type SettingsGroup = "theme" | "layout" | "extras";

type Store = {
  state: CoverState;
  data: CoverData;
  settings: CoverSettings;

  validation: ValidationReport;
  showValidation: boolean;
  setShowValidation: (show: boolean) => void;
  touchedFields: Record<string, boolean>;
  touchField: (field: string) => void;
  openSections: Record<SectionKey, boolean>;
  setSectionOpen: (section: SectionKey, open: boolean) => void;
  openAllSectionsWithErrors: () => void;

  /** Patch one group of the cover data, e.g. `patchData("student", { name })`. */
  patchData: <K extends DataSection>(section: K, patch: Partial<CoverData[K]>) => void;
  /** Patch one group of the settings, e.g. `patchSettings("theme", { accent })`. */
  patchSettings: <K extends SettingsGroup>(group: K, patch: Partial<CoverSettings[K]>) => void;
  setTemplate: (template: CoverSettings["template"]) => void;
  patchField: (key: FieldKey, patch: Partial<CoverSettings["fields"][FieldKey]>) => void;
  resetFieldLabel: (key: FieldKey) => void;

  addMember: () => void;
  updateMember: (id: string, patch: Partial<Omit<GroupMember, "id">>) => void;
  removeMember: (id: string) => void;

  /** Replace everything (draft restore, JSON import, sample data). */
  replaceState: (next: CoverState) => void;
  resetAll: () => void;
  resetSettings: () => void;
  resetSettingsGroup: (group: SettingsGroup | "fields") => void;
};

const StoreContext = createContext<Store | null>(null);

export function CoverStoreProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: CoverState;
}) {
  const [state, setState] = useState<CoverState>(() => initialState ?? defaultState());
  const memberSeq = useRef(0);

  const validation = useMemo(() => validateCoverData(state.data), [state.data]);
  const [showValidation, setShowValidation] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const touchField = useCallback((field: string) => {
    setTouchedFields((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    institution: true,
    document: true,
    student: true,
    teacher: true,
    dates: true,
  });

  const setSectionOpen = useCallback((section: SectionKey, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [section]: open }));
  }, []);

  const openAllSectionsWithErrors = useCallback(() => {
    const report = validateCoverData(state.data);
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const [sec, count] of Object.entries(report.sectionErrors)) {
        if (count > 0) next[sec as SectionKey] = true;
      }
      return next;
    });
  }, [state.data]);

  const patchData = useCallback(
    <K extends DataSection>(section: K, patch: Partial<CoverData[K]>) => {
      setState((prev) => ({
        ...prev,
        // The computed generic key widens the literal type; the public
        // signature above is what keeps callers honest.
        data: { ...prev.data, [section]: { ...prev.data[section], ...patch } } as CoverData,
      }));
    },
    [],
  );

  const patchSettings = useCallback(
    <K extends SettingsGroup>(group: K, patch: Partial<CoverSettings[K]>) => {
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          [group]: { ...prev.settings[group], ...patch },
        } as CoverSettings,
      }));
    },
    [],
  );

  const setTemplate = useCallback((template: CoverSettings["template"]) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, template } }));
  }, []);

  const patchField = useCallback(
    (key: FieldKey, patch: Partial<CoverSettings["fields"][FieldKey]>) => {
      setState((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          fields: {
            ...prev.settings.fields,
            [key]: { ...prev.settings.fields[key], ...patch },
          },
        },
      }));
    },
    [],
  );

  const resetFieldLabel = useCallback(
    (key: FieldKey) => patchField(key, { label: DEFAULT_FIELD_LABELS[key] }),
    [patchField],
  );

  const addMember = useCallback(() => {
    memberSeq.current += 1;
    const id = `m${memberSeq.current}`;
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        group: {
          ...prev.data.group,
          members: [...prev.data.group.members, { id, name: "", studentId: "" }],
        },
      },
    }));
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<Omit<GroupMember, "id">>) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        group: {
          ...prev.data.group,
          members: prev.data.group.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        },
      },
    }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        group: {
          ...prev.data.group,
          members: prev.data.group.members.filter((m) => m.id !== id),
        },
      },
    }));
  }, []);

  const replaceState = useCallback((next: CoverState) => {
    setShowValidation(false);
    setTouchedFields({});
    // Keep generated member ids unique after an import.
    const numbers = next.data.group.members
      .map((m) => Number(/^m(\d+)$/.exec(m.id)?.[1] ?? 0))
      .filter((n) => Number.isFinite(n));
    memberSeq.current = Math.max(memberSeq.current, ...numbers, 0);
    setState(next);
  }, []);

  const resetAll = useCallback(() => {
    setShowValidation(false);
    setTouchedFields({});
    setState(defaultState());
  }, []);

  const resetSettings = useCallback(() => {
    setState((prev) => ({ ...prev, settings: defaultSettings() }));
  }, []);

  const resetSettingsGroup = useCallback((group: SettingsGroup | "fields") => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, [group]: defaultSettings()[group] } as CoverSettings,
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      state,
      data: state.data,
      settings: state.settings,
      validation,
      showValidation,
      setShowValidation,
      touchedFields,
      touchField,
      openSections,
      setSectionOpen,
      openAllSectionsWithErrors,
      patchData,
      patchSettings,
      setTemplate,
      patchField,
      resetFieldLabel,
      addMember,
      updateMember,
      removeMember,
      replaceState,
      resetAll,
      resetSettings,
      resetSettingsGroup,
    }),
    [
      state,
      validation,
      showValidation,
      touchedFields,
      touchField,
      openSections,
      setSectionOpen,
      openAllSectionsWithErrors,
      patchData,
      patchSettings,
      setTemplate,
      patchField,
      resetFieldLabel,
      addMember,
      updateMember,
      removeMember,
      replaceState,
      resetAll,
      resetSettings,
      resetSettingsGroup,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCoverStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useCoverStore must be used inside <CoverStoreProvider>");
  return store;
}
