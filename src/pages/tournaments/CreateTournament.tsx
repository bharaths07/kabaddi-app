import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveTournament, type Tournament, type TFormat } from '../../features/kabaddi/state/tournamentStore'
import { useAuth } from '../../shared/context/AuthContext'
import './tournament-wizard.css'

export default function CreateTournament() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 1. Unified State for Pro Level creation
    const [form, setForm] = useState({
        basic: {
            name: "",
            banner: null as { file: File; preview: string } | null,
            format: "league" as TFormat,
            teamsCount: 8,
            startDate: "",
            category: "Open"
        },
        organizer: {
            name: "",
            phone: "",
            whatsapp: "",
            email: ""
        },
        matchSetup: {
            type: "standard" as "standard" | "short" | "custom",
            halfDuration: 20,
            playersOnMat: 7,
            squadSize: 12,
            raidTimer: 30,
            allOutPoints: 2,
            superTackle: true,
            bonus: true,
            dod: true
        },
        location: {
            venue: "",
            city: "",
            groundType: "mat" as "mat" | "mud",
            isIndoor: true,
            mapsLink: "",
            district: "",
            state: ""
        }
    })

    const [isValid, setIsValid] = useState(false)

    // Load draft if exists
    useEffect(() => {
        const draft = localStorage.getItem("pl.tournament_draft")
        if (draft) {
            try {
                const parsed = JSON.parse(draft)
                // Note: banner preview URL won't work after refresh, need to handle
                setForm(prev => ({ ...prev, ...parsed, basic: { ...parsed.basic, banner: null } }))
            } catch (e) {
                console.error("Failed to load draft", e)
            }
        }
    }, [])

    // Real-time Validation & Draft Save
    useEffect(() => {
        const { basic, organizer, location } = form
        const valid = !!(
            basic.name.trim() && 
            basic.startDate && 
            organizer.name.trim() && 
            organizer.phone.trim() && 
            location.venue.trim() && 
            location.city.trim()
        )
        setIsValid(valid)

        // Auto-save draft (minus the file object)
        const draftData = { ...form }
        // @ts-ignore
        delete draftData.basic.banner
        localStorage.setItem("pl.tournament_draft", JSON.stringify(draftData))
    }, [form])

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setForm(prev => ({ 
                ...prev, 
                basic: { ...prev.basic, banner: { file, preview: url } } 
            }))
        }
    }

    const handleCreate = () => {
        if (!isValid) return

        const id = `t-${Date.now()}`
        const newTournament: Tournament = {
            id,
            name: form.basic.name,
            banner: form.basic.banner?.preview,
            organizer: form.organizer.name,
            contact: form.organizer.phone,
            contactWhatsapp: form.organizer.whatsapp,
            contactEmail: form.organizer.email,
            level: form.basic.category,
            venue: form.location.venue,
            cityState: `${form.location.city}, ${form.location.state}`,
            district: form.location.district,
            state: form.location.state,
            groundType: form.location.groundType,
            isIndoor: form.location.isIndoor,
            mapsLink: form.location.mapsLink,
            startDate: form.basic.startDate,
            endDate: form.basic.startDate, // Default same
            format: form.basic.format,
            halfDuration: form.matchSetup.halfDuration,
            squadSize: form.matchSetup.squadSize,
            playersOnCourt: form.matchSetup.playersOnMat,
            raidTimer: form.matchSetup.raidTimer,
            allOutPoints: form.matchSetup.allOutPoints,
            doOrDie: form.matchSetup.dod,
            courts: 1, // Default
            superTackle: form.matchSetup.superTackle,
            bonusLine: form.matchSetup.bonus,
            entryFee: "Free", // Default
            prize: "Trophy", // Default
            status: 'draft',
            created_by: user?.id,
            teams: [],
            groups: [],
            rounds: [],
            fixtures: [],
            createdAt: new Date().toISOString()
        }

        saveTournament(newTournament)
        localStorage.removeItem("pl.tournament_draft")
        navigate(`/tournaments/${id}/setup`)
    }

    return (
        <div className="tw-page">
            <div className="tw-header">
                <button className="tw-back" onClick={() => navigate(-1)}>← Back</button>
                <div className="tw-header-info">
                    <div className="tw-header-title">🏆 Pro Tournament Designer</div>
                    <div className="tw-header-sub">Define the battlefield in one screen</div>
                </div>
            </div>

            <div className="tw-pro-container">
                {/* ── LEFT: Form Sections ── */}
                <div className="tw-pro-form">
                    
                    {/* 1. BASIC INFO */}
                    <div className="tw-pro-section">
                        <div className="tw-section-header">1. BASIC INFO (MANDATORY)</div>
                        
                        <div className="tw-banner-upload" onClick={() => fileInputRef.current?.click()}>
                            {form.basic.banner ? (
                                <img src={form.basic.banner.preview} alt="Banner Preview" className="tw-banner-preview-img" />
                            ) : (
                                <div className="tw-banner-placeholder">
                                    <span className="tw-icon">🖼️</span>
                                    <span>Upload Tournament Banner / Logo *</span>
                                    <span className="tw-sub">Recommended: 1200x400px</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleBannerUpload} />
                        </div>

                        <div className="tw-form-group">
                            <label className="tw-label">Tournament Name *</label>
                            <input 
                                className="tw-input lg" 
                                placeholder="e.g. Saptagiri Pro Kabaddi Cup" 
                                value={form.basic.name}
                                onChange={e => setForm({ ...form, basic: { ...form.basic, name: e.target.value } })}
                            />
                        </div>

                        <div className="tw-form-row">
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Format</label>
                                <select 
                                    className="tw-input"
                                    value={form.basic.format}
                                    onChange={e => setForm({ ...form, basic: { ...form.basic, format: e.target.value as any } })}
                                >
                                    <option value="league">League</option>
                                    <option value="knockout">Knockout</option>
                                    <option value="league_ko">League + Knockout</option>
                                </select>
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Expected Teams *</label>
                                <input 
                                    type="number" 
                                    className="tw-input" 
                                    value={form.basic.teamsCount}
                                    onChange={e => setForm({ ...form, basic: { ...form.basic, teamsCount: parseInt(e.target.value) } })}
                                />
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Start Date *</label>
                                <input 
                                    type="date" 
                                    className="tw-input" 
                                    value={form.basic.startDate}
                                    onChange={e => setForm({ ...form, basic: { ...form.basic, startDate: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. ORGANIZER INFO */}
                    <div className="tw-pro-section">
                        <div className="tw-section-header">2. ORGANIZER INFO</div>
                        <div className="tw-form-row">
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Organizer Name *</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="Your Name" 
                                    value={form.organizer.name}
                                    onChange={e => setForm({ ...form, organizer: { ...form.organizer, name: e.target.value } })}
                                />
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Contact Number *</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="10-digit number" 
                                    value={form.organizer.phone}
                                    onChange={e => setForm({ ...form, organizer: { ...form.organizer, phone: e.target.value } })}
                                />
                            </div>
                        </div>
                        <div className="tw-form-row">
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">WhatsApp (Optional)</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="WhatsApp Number" 
                                    value={form.organizer.whatsapp}
                                    onChange={e => setForm({ ...form, organizer: { ...form.organizer, whatsapp: e.target.value } })}
                                />
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Email (Optional)</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="organizer@email.com" 
                                    value={form.organizer.email}
                                    onChange={e => setForm({ ...form, organizer: { ...form.organizer, email: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. MATCH SETUP (KABADDI SPECIFIC) */}
                    <div className="tw-pro-section">
                        <div className="tw-section-header">3. MATCH SETUP (KABADDI RULES)</div>
                        <div className="tw-match-spec-grid">
                            <div className="tw-spec-item">
                                <label className="tw-label">Match Type</label>
                                <div className="tw-seg-ctrl pro">
                                    {['standard', 'short', 'custom'].map(t => (
                                        <button 
                                            key={t}
                                            className={`tw-seg-btn ${form.matchSetup.type === t ? 'active' : ''}`}
                                            onClick={() => {
                                                const updates = t === 'standard' ? { halfDuration: 20, raidTimer: 30 } : t === 'short' ? { halfDuration: 15, raidTimer: 30 } : {}
                                                setForm({ ...form, matchSetup: { ...form.matchSetup, type: t as any, ...updates } })
                                            }}
                                        >
                                            {t.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="tw-spec-item">
                                <label className="tw-label">Half Duration (Mins)</label>
                                <input className="tw-input" type="number" value={form.matchSetup.halfDuration} onChange={e => setForm({ ...form, matchSetup: { ...form.matchSetup, halfDuration: parseInt(e.target.value) } })} />
                            </div>
                            <div className="tw-spec-item">
                                <label className="tw-label">Players on Mat</label>
                                <select className="tw-input" value={form.matchSetup.playersOnMat} onChange={e => setForm({ ...form, matchSetup: { ...form.matchSetup, playersOnMat: parseInt(e.target.value) } })}>
                                    {[5, 7, 9].map(n => <option key={n} value={n}>{n} Players</option>)}
                                </select>
                            </div>
                            <div className="tw-spec-item">
                                <label className="tw-label">Raid Timer (Secs)</label>
                                <input className="tw-input" type="number" value={form.matchSetup.raidTimer} onChange={e => setForm({ ...form, matchSetup: { ...form.matchSetup, raidTimer: parseInt(e.target.value) } })} />
                            </div>
                            <div className="tw-spec-item">
                                <label className="tw-label">All-Out Points</label>
                                <input className="tw-input" type="number" value={form.matchSetup.allOutPoints} onChange={e => setForm({ ...form, matchSetup: { ...form.matchSetup, allOutPoints: parseInt(e.target.value) } })} />
                            </div>
                        </div>

                        <div className="tw-rules-toggles">
                            <div className="tw-toggle-row">
                                <span className="tw-rule-name">Bonus Line</span>
                                <div className={`tw-toggle ${form.matchSetup.bonus ? 'active' : ''}`} onClick={() => setForm({ ...form, matchSetup: { ...form.matchSetup, bonus: !form.matchSetup.bonus } })}>
                                    <div className="tw-toggle-thumb" />
                                </div>
                            </div>
                            <div className="tw-toggle-row">
                                <span className="tw-rule-name">Super Tackle</span>
                                <div className={`tw-toggle ${form.matchSetup.superTackle ? 'active' : ''}`} onClick={() => setForm({ ...form, matchSetup: { ...form.matchSetup, superTackle: !form.matchSetup.superTackle } })}>
                                    <div className="tw-toggle-thumb" />
                                </div>
                            </div>
                            <div className="tw-toggle-row">
                                <span className="tw-rule-name">Do-or-Die Raid (DOD)</span>
                                <div className={`tw-toggle ${form.matchSetup.dod ? 'active' : ''}`} onClick={() => setForm({ ...form, matchSetup: { ...form.matchSetup, dod: !form.matchSetup.dod } })}>
                                    <div className="tw-toggle-thumb" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. LOCATION DETAILS */}
                    <div className="tw-pro-section">
                        <div className="tw-section-header">4. LOCATION DETAILS</div>
                        <div className="tw-form-row">
                            <div className="tw-form-group" style={{ flex: 2 }}>
                                <label className="tw-label">Venue Name *</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="e.g. Sports Stadium Bengaluru" 
                                    value={form.location.venue}
                                    onChange={e => setForm({ ...form, location: { ...form.location, venue: e.target.value } })}
                                />
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">Ground Type</label>
                                <select className="tw-input" value={form.location.groundType} onChange={e => setForm({ ...form, location: { ...form.location, groundType: e.target.value as any } })}>
                                    <option value="mat">Mat</option>
                                    <option value="mud">Mud</option>
                                </select>
                            </div>
                        </div>
                        <div className="tw-form-row">
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">City/Town *</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="Bengaluru" 
                                    value={form.location.city}
                                    onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
                                />
                            </div>
                            <div className="tw-form-group" style={{ flex: 1 }}>
                                <label className="tw-label">District/State</label>
                                <input 
                                    className="tw-input" 
                                    placeholder="Karnataka" 
                                    value={form.location.state}
                                    onChange={e => setForm({ ...form, location: { ...form.location, state: e.target.value } })}
                                />
                            </div>
                        </div>
                        <div className="tw-form-group">
                            <label className="tw-label">Google Maps Link (Optional)</label>
                            <input 
                                className="tw-input" 
                                placeholder="Paste Maps URL" 
                                value={form.location.mapsLink}
                                onChange={e => setForm({ ...form, location: { ...form.location, mapsLink: e.target.value } })}
                            />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Live Preview (Sticky) ── */}
                <div className="tw-pro-preview">
                    <div className="tw-preview-card">
                        <div className="tw-preview-header">LIVE PREVIEW</div>
                        <div className="tw-preview-banner">
                            {form.basic.banner ? (
                                <img src={form.basic.banner.preview} alt="Banner" />
                            ) : (
                                <div className="tw-preview-banner-placeholder">Your Banner Here</div>
                            )}
                        </div>
                        <div className="tw-preview-body">
                            <div className="tw-preview-title">{form.basic.name || "Untitled Tournament"}</div>
                            <div className="tw-preview-meta">
                                <div className="tw-preview-item">
                                    <span className="tw-icon">📍</span>
                                    <span>{form.location.venue || "Location TBD"}, {form.location.city || "City"}</span>
                                </div>
                                <div className="tw-preview-item">
                                    <span className="tw-icon">📅</span>
                                    <span>Starts: {form.basic.startDate ? new Date(form.basic.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : "Date TBD"}</span>
                                </div>
                                <div className="tw-preview-item">
                                    <span className="tw-icon">👥</span>
                                    <span>{form.basic.teamsCount} Teams</span>
                                </div>
                                <div className="tw-preview-item">
                                    <span className="tw-icon">🏷️</span>
                                    <span>{form.basic.category} · {form.basic.format.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="tw-preview-organizer">
                                <div className="tw-org-label">ORGANIZED BY</div>
                                <div className="tw-org-name">{form.organizer.name || "TBD"}</div>
                            </div>

                            <div className="tw-preview-rules">
                                <div className="tw-rule-pill">{form.matchSetup.halfDuration}m Half</div>
                                <div className="tw-rule-pill">{form.matchSetup.playersOnMat} Mat</div>
                                <div className="tw-rule-pill">{form.location.groundType.toUpperCase()}</div>
                                {form.matchSetup.superTackle && <div className="tw-rule-pill">Super Tackle</div>}
                                {form.matchSetup.bonus && <div className="tw-rule-pill">Bonus</div>}
                            </div>
                        </div>

                        <button 
                            className={`tw-pro-create-btn ${isValid ? 'ready' : ''}`}
                            disabled={!isValid}
                            onClick={handleCreate}
                        >
                            {isValid ? 'Create Tournament →' : 'Complete Required Fields'}
                        </button>
                        {!isValid && <div className="tw-validation-hint">Check mandatory (*) fields</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
