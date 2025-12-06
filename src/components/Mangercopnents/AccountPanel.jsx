// src/components/Mangercopnents/AccountPanel.jsx
import React from "react";
import axios from "axios";
import { FiCamera, FiUpload } from "react-icons/fi";

const USERS_API_URL = "http://localhost:5001/api/users";

export default function AccountPanel({ settings, setSettings }) {
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: "",
  });

  const [dirty, setDirty] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const fileRef = React.useRef(null);

  // ---- logged in manager from localStorage ----
  const logged = React.useMemo(
    () => JSON.parse(localStorage.getItem("loggedUser") || "null"),
    []
  );
  const userId = logged?.userId;

  // ========== LOAD PROFILE FROM BACKEND ==========
  React.useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setError("No logged-in user found (localStorage.loggedUser).");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        // GET /api/users/:id
        const res = await axios.get(`${USERS_API_URL}/${userId}`);
        const user = res.data;

        const fullName = user.name || "";
        const parts = fullName.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        setForm({
          firstName,
          lastName,
          email: user.email || "",
          avatarUrl: user.avatarUrl || "",
        });

        setDirty(false);
      } catch (err) {
        console.error("Load manager account error:", err);
        setError("Failed to load account information.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  // ========== FORM HELPERS ==========
  const onChangeField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
    setError("");
    setSuccess("");
  };

  const onPickAvatar = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChangeField("avatarUrl", url);

    // if you later add backend upload, you can POST the file here
  };

  // ========== SAVE TO BACKEND ==========
  const onSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const fullName = `${form.firstName || ""} ${form.lastName || ""}`.trim();

      const payload = {
        name: fullName,
        email: form.email,
        avatarUrl: form.avatarUrl, // backend may ignore this if not in schema
      };

      const res = await axios.put(`${USERS_API_URL}/${userId}`, payload);
      const updated = res.data;

      // update localStorage copy used across the app
      const updatedLogged = {
        ...(logged || {}),
        userId: updated._id || userId,
        name: updated.name || fullName,
        email: updated.email || form.email,
      };
      localStorage.setItem("loggedUser", JSON.stringify(updatedLogged));

      setDirty(false);
      setSuccess("Profile saved successfully!");
    } catch (err) {
      console.error("Save manager account error:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="container-xxl p-4">
        <div>Loading account information…</div>
      </div>
    );
  }

  return (
    <div className="container-xxl">
      <div className="card-neo p-4 mb-4">
        <h5 className="mb-1">Profile Settings</h5>
        <div className="text-muted mb-3">
          Manage your account settings and preferences
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-2">{error}</div>
        )}
        {success && (
          <div className="alert alert-success py-2 small mb-2">{success}</div>
        )}

        {/* Avatar row */}
        <div className="acct__section">
          <div className="acct__photo">
            <div className="acct__avatar">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" />
              ) : (
                <div className="acct__avatar-fallback" aria-label="Avatar">
                  <span className="acct__avatar-circle" />
                </div>
              )}
              <button
                type="button"
                className="acct__avatar-pick"
                onClick={onPickAvatar}
                title="Change photo"
                aria-label="Change photo"
              >
                <FiCamera />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFile}
              />
            </div>

            <button
              type="button"
              className="btn btn-sm btn-light acct__upload-btn"
              onClick={onPickAvatar}
            >
              <FiUpload className="me-1" />
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Personal info */}
        <div className="acct__section mt-3">
          <h6 className="mb-3">Personal Information</h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small">First Name</label>
              <input
                className="form-control acct__input"
                value={form.firstName}
                onChange={(e) => onChangeField("firstName", e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Last Name</label>
              <input
                className="form-control acct__input"
                value={form.lastName}
                onChange={(e) => onChangeField("lastName", e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label small">Email Address</label>
              <input
                type="email"
                className="form-control acct__input"
                value={form.email}
                onChange={(e) => onChangeField("email", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!dirty || saving}
              onClick={onSave}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="acct__section mt-3">
          <div className="row g-4">
            <div className="col-md-6">
              <label className="form-label small d-block">Notifications</label>
              <div className="acct__toggle-line">
                <span className="text-muted small me-2">
                  Send notifications
                </span>
                <label className="acct__switch">
                  <input
                    type="checkbox"
                    checked={!!settings.sendNotifications}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sendNotifications: e.target.checked,
                      })
                    }
                  />
                  <span className="acct__slider" />
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label small d-block">
                Default Theme for Users
              </label>
              <select
                className="form-select acct__select"
                value={settings.themeOption || "light"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    themeOption: e.target.value,
                  })
                }
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="system">System Theme</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
