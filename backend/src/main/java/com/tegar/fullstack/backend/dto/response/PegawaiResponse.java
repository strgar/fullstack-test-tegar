package com.tegar.fullstack.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PegawaiResponse {
    private String profile;
    private String idUser;
    private String namaLengkap;
    private String tempatLahir;
    private Long tanggalLahir;
    private String email;
    private String nikUser;
    
    @JsonProperty("kdJabatan")
    private Integer kdJabatan;
    
    @JsonProperty("namaJabatan")
    private String namaJabatan;
    
    @JsonProperty("kdDepartemen")
    private Integer kdDepartemen;
    
    @JsonProperty("namaDepartemen")
    private String namaDepartemen;
    
    @JsonProperty("kdUnitKerja")
    private Integer kdUnitKerja;
    
    @JsonProperty("namaUnitKerja")
    private String namaUnitKerja;
    
    @JsonProperty("kdJenisKelamin")
    private Integer kdJenisKelamin;
    
    @JsonProperty("namaJenisKelamin")
    private String namaJenisKelamin;
    
    @JsonProperty("kdPendidikan")
    private Integer kdPendidikan;
    
    @JsonProperty("namaPendidikan")
    private String namaPendidikan;
    
    private String photo;
}
