package com.tegar.fullstack.backend.controller;

import com.tegar.fullstack.backend.dto.request.ItemRequest;
import com.tegar.fullstack.backend.dto.response.ItemResponse;
import com.tegar.fullstack.backend.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {

    private final ItemService svc;

    public ItemController(ItemService svc) {
        this.svc = svc;
    }

    @GetMapping
    public ResponseEntity<List<ItemResponse>> list() {
        return ResponseEntity.ok(svc.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @PostMapping
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemRequest req) {
        ItemResponse res = svc.create(req);
        return ResponseEntity.created(URI.create("/api/v1/items/" + res.getId())).body(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponse> update(@PathVariable Long id, @Valid @RequestBody ItemRequest req) {
        return ResponseEntity.ok(svc.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}
