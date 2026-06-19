"use client";

import React from "react";
import { Form, TextField, Label, Input, Button } from "react-aria-components";

export function RegisterEvaluatorForm() {
  return (
    <Form method="post" action="/api/admin/evaluators">
      <TextField isRequired name="name" className="form-group">
        <Label className="form-label">Full Name</Label>
        <Input className="input-field" placeholder="e.g. Dr. Arthur Pendragon" required />
      </TextField>

      <TextField isRequired type="email" name="email" className="form-group">
        <Label className="form-label">Email Address</Label>
        <Input className="input-field" placeholder="e.g. arthur@hospital.com" required />
      </TextField>

      <TextField name="contactNo" className="form-group">
        <Label className="form-label">Contact Number (Optional)</Label>
        <Input className="input-field" placeholder="e.g. +639171234567" />
      </TextField>

      <TextField isRequired type="password" name="password" className="form-group">
        <Label className="form-label">Temporary Password</Label>
        <Input minLength={6} className="input-field" placeholder="••••••••" required />
      </TextField>

      <Button type="submit" className="button-primary" style={{ width: "100%", marginTop: 12 }}>
        Add Evaluator
      </Button>
    </Form>
  );
}
