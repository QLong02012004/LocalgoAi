import React, { useState, useEffect } from "react";
import { type RoutePoint } from "../../types";
import styles from "./EditSpotModal.module.scss";
import { X, Notepad, Clock, CalendarBlank, MapPin } from "@phosphor-icons/react";
import Select, { type StylesConfig } from "react-select";

interface Props {
  point: RoutePoint;
  onClose: () => void;
  onSave: (updatedPoint: RoutePoint) => void;
  maxDays?: number;
}

const customSelectStyles: StylesConfig<any, false> = {
  control: (base, state) => ({
    ...base,
    paddingLeft: '32px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: state.isFocused ? '1px solid #0ea5e9' : '1px solid #e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(14, 165, 233, 0.1)' : 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
    minHeight: '45px',
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: state.isFocused ? '#0ea5e9' : '#cbd5e1'
    }
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 16px'
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    zIndex: 10001
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: state.isSelected ? '#0ea5e9' : state.isFocused ? '#f1f5f9' : 'transparent',
    color: state.isSelected ? 'white' : '#1e293b',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#0ea5e9',
      color: 'white'
    }
  }),
  placeholder: (base) => ({ ...base, color: '#94a3b8' }),
  singleValue: (base) => ({ ...base, color: '#1e293b' }),
  dropdownIndicator: (base) => ({ ...base, color: '#94a3b8' }),
  indicatorSeparator: () => ({ display: 'none' })
};

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${String(i).padStart(2, '0')} giờ`
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: `${String(i).padStart(2, '0')} phút`
}));

const durationOptions = [
  { value: 15, label: '15 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '1 giờ' },
  { value: 90, label: '1 giờ 30 phút' },
  { value: 120, label: '2 giờ' },
  { value: 180, label: '3 giờ' },
  { value: 240, label: '4 giờ' },
];

const EditSpotModal: React.FC<Props> = ({ point, onClose, onSave, maxDays = 3 }) => {
  const [name, setName] = useState(point.name);
  const [hour, setHour] = useState(point.time.split(':')[0]);
  const [minute, setMinute] = useState(point.time.split(':')[1]);
  const [duration, setDuration] = useState(point.durationMinutes || 60);
  const [note, setNote] = useState(point.note || "");
  const [daySelect, setDaySelect] = useState(point.day || 1);
  const [alternatives, setAlternatives] = useState<Omit<RoutePoint, 'id' | 'day' | 'time' | 'endTime'>[]>(point.alternatives || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const calculateEndTime = (startH: string, startM: string, durMins: number) => {
    const totalMins = parseInt(startH) * 60 + parseInt(startM) + durMins;
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const calculatedEndTime = calculateEndTime(hour, minute, duration);

  const dayOptions = Array.from({ length: maxDays }, (_, i) => ({
    value: i + 1,
    label: `Ngày ${i + 1}`
  }));

  // Auto-search for alternatives
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        import("axios").then(axios => {
          axios.default.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&countrycodes=vn&limit=5`)
            .then((res) => {
              setSuggestions(res.data || []);
            })
            .catch((e) => console.error(e))
            .finally(() => setIsSearching(false));
        });
      } else {
        setSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectAlternative = (item: any) => {
    const newAlt: Omit<RoutePoint, 'id' | 'day' | 'time' | 'endTime'> = {
      name: item.name || item.display_name.split(",")[0],
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name,
      type: 'attraction',
      description: `Phương án dự phòng tại ${item.display_name}`
    };
    setAlternatives(prev => [...prev, newAlt]);
    setSearchQuery("");
    setSuggestions([]);
  };

  const removeAlternative = (idx: number) => {
    setAlternatives(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...point,
      name,
      time: `${hour}:${minute}`,
      endTime: calculatedEndTime,
      durationMinutes: duration,
      note: note.trim() || undefined,
      day: daySelect,
      alternatives: alternatives.length > 0 ? alternatives : undefined
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Chỉnh sửa địa điểm</h2>
          <button type="button" className={styles.modalClose} onClick={onClose} title="Đóng">
            <X size={20} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.editSpotForm}>
          <div className={styles.formBody}>
            <div className={styles.mainInfoGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-name">Tên địa điểm chính</label>
                <div className={styles.inputWrapper}>
                  <MapPin size={18} weight="fill" className={styles.inputIcon} />
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên địa điểm..."
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ngày</label>
                  <div className={styles.inputWrapper}>
                    <CalendarBlank size={18} weight="fill" className={styles.inputIcon} />
                    <div style={{ width: '100%' }}>
                      <Select 
                        options={dayOptions}
                        value={dayOptions.find(opt => opt.value === daySelect)}
                        onChange={(opt) => setDaySelect(opt?.value || 1)}
                        styles={customSelectStyles}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Giờ ghé thăm</label>
                  <div className={styles.timeSelectRow}>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <Clock size={18} weight="fill" className={styles.inputIcon} />
                      <div style={{ width: '100%' }}>
                        <Select 
                          options={hourOptions}
                          value={hourOptions.find(opt => opt.value === hour)}
                          onChange={(opt) => setHour(opt?.value || '08')}
                          styles={customSelectStyles}
                          isSearchable={false}
                        />
                      </div>
                    </div>
                    <span className={styles.timeSeparator}>:</span>
                    <div className={styles.inputWrapper} style={{ flex: 1 }}>
                      <div style={{ width: '100%' }}>
                        <Select 
                          options={minuteOptions}
                          value={minuteOptions.find(opt => opt.value === minute)}
                          onChange={(opt) => setMinute(opt?.value || '00')}
                          styles={{
                            ...customSelectStyles,
                            control: (base, state) => ({
                              ...base,
                              paddingLeft: '12px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              border: state.isFocused ? '1px solid #0ea5e9' : '1px solid #e2e8f0',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              minHeight: '45px'
                            })
                          }}
                          isSearchable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Thời gian dừng chân</label>
                  <div className={styles.inputWrapper}>
                    <div style={{ width: '100%' }}>
                      <Select 
                        options={durationOptions}
                        value={durationOptions.find(opt => opt.value === duration)}
                        onChange={(opt) => setDuration(opt?.value || 60)}
                        styles={{
                          ...customSelectStyles,
                          control: (base, state) => ({
                            ...base,
                            paddingLeft: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            border: state.isFocused ? '1px solid #0ea5e9' : '1px solid #e2e8f0',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            minHeight: '45px'
                          })
                        }}
                        isSearchable={false}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Dự kiến kết thúc</label>
                  <div className={styles.endTimeDisplay}>
                    <Clock size={18} weight="bold" />
                    <span>{calculatedEndTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.noteAndAltGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-note">Ghi chú & Nhắc nhở</label>
                <div className={styles.textareaWrapper}>
                  <Notepad size={18} weight="fill" className={styles.textareaIcon} />
                  <textarea
                    id="edit-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Món nên thử, vật dụng cần mang..."
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.alternativesSection}>
                <label>Phương án dự phòng (Nếu thời tiết xấu/đóng cửa)</label>
                <div className={styles.altSearchWrapper}>
                   <MapPin size={18} weight="bold" className={styles.searchIcon} />
                   <input 
                    type="text" 
                    placeholder="Tìm địa điểm dự phòng..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   {isSearching && <div className={styles.miniSpinner}></div>}
                </div>
                
                {suggestions.length > 0 && (
                  <div className={styles.altSuggestions}>
                    {suggestions.map((s, i) => (
                      <div key={i} className={styles.altSugItem} onClick={() => handleSelectAlternative(s)}>
                        <div className={styles.sugName}>{s.name || s.display_name.split(',')[0]}</div>
                        <div className={styles.sugAddr}>{s.display_name}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.altList}>
                  {alternatives.map((alt, i) => (
                    <div key={i} className={styles.altChip}>
                      <MapPin size={14} weight="fill" />
                      <span>{alt.name}</span>
                      <button type="button" onClick={() => removeAlternative(i)}><X size={12} weight="bold" /></button>
                    </div>
                  ))}
                  {alternatives.length === 0 && (
                    <p className={styles.emptyAlt}>Chưa có phương án dự phòng nào.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Hủy</button>
            <button type="submit" className={styles.saveBtn}>Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSpotModal;
