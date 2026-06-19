"use client";

import React from "react";
import { Form, TextField, Label, Input, Button } from "react-aria-components";

interface ProcedureOption {
  id: string;
  name: string;
  typeName: string;
}

interface ProcedureLogFormProps {
  procedures: ProcedureOption[];
}

export function ProcedureLogForm({ procedures }: ProcedureLogFormProps) {
  return (
    <Form method="post" action="/api/resident/procedures">
      <div className="form-group">
        <label className="form-label" htmlFor="proc-select">Select Procedure</label>
        <select id="proc-select" name="procedureId" className="input-field" required>
          <option value="">Choose procedure...</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.typeName})</option>
          ))}
        </select>
      </div>

      <TextField isRequired name="patientHRN" className="form-group">
        <Label className="form-label">Patient HRN (Hospital Record Number)</Label>
        <Input className="input-field" placeholder="e.g. HRN-12345" required />
      </TextField>

      <TextField name="patientName" className="form-group">
        <Label className="form-label">Patient Name (Optional)</Label>
        <Input className="input-field" placeholder="e.g. Jane Doe" />
      </TextField>

      <div className="row" style={{ marginBottom: 0 }}>
        <TextField name="patientAge" className="col form-group">
          <Label className="form-label">Patient Age (Optional)</Label>
          <Input type="number" min={0} className="input-field" placeholder="30" />
        </TextField>
        
        <div className="col form-group">
          <label className="form-label" htmlFor="pat-gender">Gender (Optional)</label>
          <select id="pat-gender" name="patientGender" className="input-field">
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="proc-status">Supervision Status</label>
        <select id="proc-status" name="status" className="input-field" required>
          <option value="COMPLETED">Completed (Independent)</option>
          <option value="SUPERVISED">Supervised (Under Consultant)</option>
        </select>
      </div>

      <Button type="submit" className="button-primary" style={{ width: "100%", marginTop: 12 }}>
        Log Procedure
      </Button>
    </Form>
  );
}
